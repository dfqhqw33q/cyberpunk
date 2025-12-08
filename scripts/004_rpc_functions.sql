-- Helper function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_user_id UUID,
    p_action audit_action,
    p_details JSONB DEFAULT '{}'::jsonb,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_performed_by UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent, performed_by)
    VALUES (p_user_id, p_action, p_details, p_ip_address, p_user_agent, p_performed_by)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- Login function with lockout protection
CREATE OR REPLACE FUNCTION app_login(
    p_username TEXT,
    p_password TEXT,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_password_valid BOOLEAN;
    v_result JSONB;
BEGIN
    -- Find user by username
    SELECT * INTO v_user
    FROM app_users
    WHERE username = LOWER(TRIM(p_username));
    
    -- User not found
    IF v_user IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid username or password',
            'code', 'INVALID_CREDENTIALS'
        );
    END IF;
    
    -- Check if account is locked
    IF v_user.is_locked THEN
        PERFORM log_audit_event(
            v_user.id,
            'login_failed',
            jsonb_build_object('reason', 'Account locked'),
            p_ip_address,
            p_user_agent
        );
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Your account is locked. Contact Admin.',
            'code', 'ACCOUNT_LOCKED'
        );
    END IF;
    
    -- Check if account is active
    IF NOT v_user.is_active THEN
        PERFORM log_audit_event(
            v_user.id,
            'login_failed',
            jsonb_build_object('reason', 'Account inactive'),
            p_ip_address,
            p_user_agent
        );
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Your account is deactivated. Contact Admin.',
            'code', 'ACCOUNT_INACTIVE'
        );
    END IF;
    
    -- Verify password
    v_password_valid := v_user.password_hash = crypt(p_password, v_user.password_hash);
    
    IF NOT v_password_valid THEN
        -- Increment failed attempts
        UPDATE app_users
        SET failed_attempts = failed_attempts + 1,
            is_locked = CASE WHEN failed_attempts + 1 >= 3 THEN true ELSE false END
        WHERE id = v_user.id;
        
        -- Check if this attempt locks the account
        IF v_user.failed_attempts + 1 >= 3 THEN
            PERFORM log_audit_event(
                v_user.id,
                'account_locked',
                jsonb_build_object('reason', 'Too many failed login attempts'),
                p_ip_address,
                p_user_agent
            );
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Your account is locked. Contact Admin.',
                'code', 'ACCOUNT_LOCKED'
            );
        ELSE
            PERFORM log_audit_event(
                v_user.id,
                'login_failed',
                jsonb_build_object(
                    'reason', 'Invalid password',
                    'attempts_remaining', 3 - (v_user.failed_attempts + 1)
                ),
                p_ip_address,
                p_user_agent
            );
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Invalid username or password',
                'code', 'INVALID_CREDENTIALS',
                'attempts_remaining', 3 - (v_user.failed_attempts + 1)
            );
        END IF;
    END IF;
    
    -- Check password expiry
    IF v_user.password_expires_at < NOW() THEN
        PERFORM log_audit_event(
            v_user.id,
            'login_failed',
            jsonb_build_object('reason', 'Password expired'),
            p_ip_address,
            p_user_agent
        );
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Your password has expired. Please reset it.',
            'code', 'PASSWORD_EXPIRED',
            'user_id', v_user.id
        );
    END IF;
    
    -- Successful login - reset failed attempts
    UPDATE app_users
    SET failed_attempts = 0
    WHERE id = v_user.id;
    
    -- Log successful login
    PERFORM log_audit_event(
        v_user.id,
        'login_success',
        '{}'::jsonb,
        p_ip_address,
        p_user_agent
    );
    
    -- Return user data (excluding password)
    RETURN jsonb_build_object(
        'success', true,
        'user', jsonb_build_object(
            'id', v_user.id,
            'username', v_user.username,
            'user_level', v_user.user_level,
            'restrictions', v_user.restrictions,
            'is_active', v_user.is_active,
            'password_expires_at', v_user.password_expires_at
        )
    );
END;
$$;

-- Admin: Register new user
CREATE OR REPLACE FUNCTION admin_register_user(
    p_admin_id UUID,
    p_username TEXT,
    p_password TEXT,
    p_user_level user_level DEFAULT 'regular',
    p_restrictions JSONB DEFAULT '{
        "can_add_users": false,
        "can_edit_users": false,
        "can_view_logs": false,
        "can_manage_roles": false
    }'::jsonb,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin RECORD;
    v_new_user_id UUID;
    v_password_hash TEXT;
BEGIN
    -- Verify admin permissions
    SELECT * INTO v_admin
    FROM app_users
    WHERE id = p_admin_id AND user_level = 'admin';
    
    IF v_admin IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Admin access required',
            'code', 'UNAUTHORIZED'
        );
    END IF;
    
    -- Check if admin has permission to add users
    IF NOT (v_admin.restrictions->>'can_add_users')::boolean AND v_admin.user_level != 'admin' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Missing permission to add users',
            'code', 'PERMISSION_DENIED'
        );
    END IF;
    
    -- Check if username already exists
    IF EXISTS (SELECT 1 FROM app_users WHERE username = LOWER(TRIM(p_username))) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Username already exists',
            'code', 'USERNAME_EXISTS'
        );
    END IF;
    
    -- Hash password
    v_password_hash := crypt(p_password, gen_salt('bf', 12));
    
    -- Create user
    INSERT INTO app_users (
        username,
        password_hash,
        user_level,
        restrictions,
        password_changed_at,
        password_expires_at
    )
    VALUES (
        LOWER(TRIM(p_username)),
        v_password_hash,
        p_user_level,
        p_restrictions,
        NOW(),
        NOW() + INTERVAL '90 days'
    )
    RETURNING id INTO v_new_user_id;
    
    -- Log the action
    PERFORM log_audit_event(
        v_new_user_id,
        'user_created',
        jsonb_build_object(
            'created_by', p_admin_id,
            'username', LOWER(TRIM(p_username)),
            'user_level', p_user_level
        ),
        p_ip_address,
        p_user_agent,
        p_admin_id
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_new_user_id,
        'message', 'User created successfully'
    );
END;
$$;

-- Admin: Edit user
CREATE OR REPLACE FUNCTION admin_edit_user(
    p_admin_id UUID,
    p_user_id UUID,
    p_username TEXT DEFAULT NULL,
    p_user_level user_level DEFAULT NULL,
    p_restrictions JSONB DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin RECORD;
    v_user RECORD;
    v_changes JSONB := '{}'::jsonb;
BEGIN
    -- Verify admin permissions
    SELECT * INTO v_admin
    FROM app_users
    WHERE id = p_admin_id AND user_level = 'admin';
    
    IF v_admin IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Admin access required',
            'code', 'UNAUTHORIZED'
        );
    END IF;
    
    -- Get current user data
    SELECT * INTO v_user
    FROM app_users
    WHERE id = p_user_id;
    
    IF v_user IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found',
            'code', 'USER_NOT_FOUND'
        );
    END IF;
    
    -- Check if new username already exists
    IF p_username IS NOT NULL AND p_username != v_user.username THEN
        IF EXISTS (SELECT 1 FROM app_users WHERE username = LOWER(TRIM(p_username)) AND id != p_user_id) THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Username already exists',
                'code', 'USERNAME_EXISTS'
            );
        END IF;
        v_changes := v_changes || jsonb_build_object('username', jsonb_build_object('old', v_user.username, 'new', LOWER(TRIM(p_username))));
    END IF;
    
    -- Track user level change
    IF p_user_level IS NOT NULL AND p_user_level::text != v_user.user_level::text THEN
        v_changes := v_changes || jsonb_build_object('user_level', jsonb_build_object('old', v_user.user_level, 'new', p_user_level));
    END IF;
    
    -- Track restrictions change
    IF p_restrictions IS NOT NULL AND p_restrictions != v_user.restrictions THEN
        v_changes := v_changes || jsonb_build_object('restrictions', jsonb_build_object('old', v_user.restrictions, 'new', p_restrictions));
    END IF;
    
    -- Update user
    UPDATE app_users
    SET
        username = COALESCE(LOWER(TRIM(p_username)), username),
        user_level = COALESCE(p_user_level, user_level),
        restrictions = COALESCE(p_restrictions, restrictions)
    WHERE id = p_user_id;
    
    -- Log the action
    PERFORM log_audit_event(
        p_user_id,
        'user_updated',
        jsonb_build_object('changes', v_changes),
        p_ip_address,
        p_user_agent,
        p_admin_id
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'User updated successfully'
    );
END;
$$;

-- Admin: Toggle user active status
CREATE OR REPLACE FUNCTION admin_toggle_active(
    p_admin_id UUID,
    p_user_id UUID,
    p_is_active BOOLEAN,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin RECORD;
    v_user RECORD;
BEGIN
    -- Verify admin permissions
    SELECT * INTO v_admin
    FROM app_users
    WHERE id = p_admin_id AND user_level = 'admin';
    
    IF v_admin IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Admin access required',
            'code', 'UNAUTHORIZED'
        );
    END IF;
    
    -- Prevent admin from deactivating themselves
    IF p_admin_id = p_user_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cannot deactivate your own account',
            'code', 'SELF_DEACTIVATION'
        );
    END IF;
    
    -- Get user
    SELECT * INTO v_user
    FROM app_users
    WHERE id = p_user_id;
    
    IF v_user IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found',
            'code', 'USER_NOT_FOUND'
        );
    END IF;
    
    -- Update status
    UPDATE app_users
    SET is_active = p_is_active
    WHERE id = p_user_id;
    
    -- Log the action
    PERFORM log_audit_event(
        p_user_id,
        CASE WHEN p_is_active THEN 'user_activated'::audit_action ELSE 'user_deactivated'::audit_action END,
        jsonb_build_object('previous_status', v_user.is_active),
        p_ip_address,
        p_user_agent,
        p_admin_id
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', CASE WHEN p_is_active THEN 'User activated' ELSE 'User deactivated' END
    );
END;
$$;

-- Admin: Unlock user
CREATE OR REPLACE FUNCTION admin_unlock_user(
    p_admin_id UUID,
    p_user_id UUID,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin RECORD;
    v_user RECORD;
BEGIN
    -- Verify admin permissions
    SELECT * INTO v_admin
    FROM app_users
    WHERE id = p_admin_id AND user_level = 'admin';
    
    IF v_admin IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Admin access required',
            'code', 'UNAUTHORIZED'
        );
    END IF;
    
    -- Get user
    SELECT * INTO v_user
    FROM app_users
    WHERE id = p_user_id;
    
    IF v_user IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found',
            'code', 'USER_NOT_FOUND'
        );
    END IF;
    
    -- Unlock user and reset failed attempts
    UPDATE app_users
    SET
        is_locked = false,
        failed_attempts = 0
    WHERE id = p_user_id;
    
    -- Log the action
    PERFORM log_audit_event(
        p_user_id,
        'account_unlocked',
        jsonb_build_object('previous_failed_attempts', v_user.failed_attempts),
        p_ip_address,
        p_user_agent,
        p_admin_id
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'User account unlocked'
    );
END;
$$;

-- Admin: Reset user password
CREATE OR REPLACE FUNCTION admin_reset_password(
    p_admin_id UUID,
    p_user_id UUID,
    p_new_password TEXT,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin RECORD;
    v_user RECORD;
    v_password_hash TEXT;
BEGIN
    -- Verify admin permissions
    SELECT * INTO v_admin
    FROM app_users
    WHERE id = p_admin_id AND user_level = 'admin';
    
    IF v_admin IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Admin access required',
            'code', 'UNAUTHORIZED'
        );
    END IF;
    
    -- Get user
    SELECT * INTO v_user
    FROM app_users
    WHERE id = p_user_id;
    
    IF v_user IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found',
            'code', 'USER_NOT_FOUND'
        );
    END IF;
    
    -- Hash new password
    v_password_hash := crypt(p_new_password, gen_salt('bf', 12));
    
    -- Update password
    UPDATE app_users
    SET
        password_hash = v_password_hash,
        password_changed_at = NOW(),
        password_expires_at = NOW() + INTERVAL '90 days',
        is_locked = false,
        failed_attempts = 0
    WHERE id = p_user_id;
    
    -- Log the action
    PERFORM log_audit_event(
        p_user_id,
        'password_reset',
        jsonb_build_object('reset_by', 'admin'),
        p_ip_address,
        p_user_agent,
        p_admin_id
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Password reset successfully'
    );
END;
$$;

-- User: Change own credentials
CREATE OR REPLACE FUNCTION user_change_credentials(
    p_user_id UUID,
    p_current_password TEXT,
    p_new_username TEXT DEFAULT NULL,
    p_new_password TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_password_valid BOOLEAN;
    v_password_hash TEXT;
    v_changes JSONB := '{}'::jsonb;
BEGIN
    -- Get user
    SELECT * INTO v_user
    FROM app_users
    WHERE id = p_user_id;
    
    IF v_user IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found',
            'code', 'USER_NOT_FOUND'
        );
    END IF;
    
    -- Verify current password
    v_password_valid := v_user.password_hash = crypt(p_current_password, v_user.password_hash);
    
    IF NOT v_password_valid THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Current password is incorrect',
            'code', 'INVALID_PASSWORD'
        );
    END IF;
    
    -- Check if new username already exists
    IF p_new_username IS NOT NULL AND LOWER(TRIM(p_new_username)) != v_user.username THEN
        IF EXISTS (SELECT 1 FROM app_users WHERE username = LOWER(TRIM(p_new_username)) AND id != p_user_id) THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Username already exists',
                'code', 'USERNAME_EXISTS'
            );
        END IF;
        v_changes := v_changes || jsonb_build_object('username', true);
    END IF;
    
    -- Prepare password update
    IF p_new_password IS NOT NULL THEN
        v_password_hash := crypt(p_new_password, gen_salt('bf', 12));
        v_changes := v_changes || jsonb_build_object('password', true);
    END IF;
    
    -- Update user
    UPDATE app_users
    SET
        username = CASE WHEN p_new_username IS NOT NULL THEN LOWER(TRIM(p_new_username)) ELSE username END,
        password_hash = CASE WHEN p_new_password IS NOT NULL THEN v_password_hash ELSE password_hash END,
        password_changed_at = CASE WHEN p_new_password IS NOT NULL THEN NOW() ELSE password_changed_at END,
        password_expires_at = CASE WHEN p_new_password IS NOT NULL THEN NOW() + INTERVAL '90 days' ELSE password_expires_at END
    WHERE id = p_user_id;
    
    -- Log the action
    PERFORM log_audit_event(
        p_user_id,
        'credentials_changed',
        v_changes,
        p_ip_address,
        p_user_agent,
        p_user_id
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Credentials updated successfully',
        'changes', v_changes
    );
END;
$$;

-- Function to get user by ID (for session validation)
CREATE OR REPLACE FUNCTION get_user_by_id(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
BEGIN
    SELECT * INTO v_user
    FROM app_users
    WHERE id = p_user_id;
    
    IF v_user IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN jsonb_build_object(
        'id', v_user.id,
        'username', v_user.username,
        'user_level', v_user.user_level,
        'restrictions', v_user.restrictions,
        'is_active', v_user.is_active,
        'is_locked', v_user.is_locked,
        'password_expires_at', v_user.password_expires_at,
        'created_at', v_user.created_at
    );
END;
$$;

-- Function to get all users (admin only)
CREATE OR REPLACE FUNCTION get_all_users(p_admin_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin RECORD;
    v_users JSONB;
BEGIN
    -- Verify admin
    SELECT * INTO v_admin
    FROM app_users
    WHERE id = p_admin_id AND user_level = 'admin';
    
    IF v_admin IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized',
            'code', 'UNAUTHORIZED'
        );
    END IF;
    
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'username', username,
            'user_level', user_level,
            'restrictions', restrictions,
            'is_active', is_active,
            'is_locked', is_locked,
            'failed_attempts', failed_attempts,
            'password_expires_at', password_expires_at,
            'created_at', created_at,
            'updated_at', updated_at
        ) ORDER BY created_at DESC
    ) INTO v_users
    FROM app_users;
    
    RETURN jsonb_build_object(
        'success', true,
        'users', COALESCE(v_users, '[]'::jsonb)
    );
END;
$$;

-- Function to get audit logs
CREATE OR REPLACE FUNCTION get_audit_logs(
    p_admin_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_action audit_action DEFAULT NULL,
    p_limit INTEGER DEFAULT 100
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin RECORD;
    v_logs JSONB;
BEGIN
    -- Verify admin
    SELECT * INTO v_admin
    FROM app_users
    WHERE id = p_admin_id AND user_level = 'admin';
    
    IF v_admin IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized',
            'code', 'UNAUTHORIZED'
        );
    END IF;
    
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', al.id,
            'user_id', al.user_id,
            'username', au.username,
            'action', al.action,
            'details', al.details,
            'ip_address', al.ip_address,
            'performed_by', al.performed_by,
            'performed_by_username', pbu.username,
            'created_at', al.created_at
        ) ORDER BY al.created_at DESC
    ) INTO v_logs
    FROM audit_logs al
    LEFT JOIN app_users au ON al.user_id = au.id
    LEFT JOIN app_users pbu ON al.performed_by = pbu.id
    WHERE (p_user_id IS NULL OR al.user_id = p_user_id)
      AND (p_action IS NULL OR al.action = p_action)
    LIMIT p_limit;
    
    RETURN jsonb_build_object(
        'success', true,
        'logs', COALESCE(v_logs, '[]'::jsonb)
    );
END;
$$;
