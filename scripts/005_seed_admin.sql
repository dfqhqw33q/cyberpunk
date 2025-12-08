-- Create initial admin user
-- Username: admin
-- Password: CyberAdmin@2025!
-- Password is hashed using bcrypt with cost factor 12

INSERT INTO app_users (
    username,
    password_hash,
    user_level,
    restrictions,
    is_active,
    is_locked,
    failed_attempts,
    password_changed_at,
    password_expires_at
)
VALUES (
    'admin',
    crypt('CyberAdmin@2025!', gen_salt('bf', 12)),
    'admin',
    '{
        "can_add_users": true,
        "can_edit_users": true,
        "can_view_logs": true,
        "can_manage_roles": true
    }'::jsonb,
    true,
    false,
    0,
    NOW(),
    NOW() + INTERVAL '90 days'
)
ON CONFLICT (username) DO NOTHING;

-- Log the admin creation
DO $$
DECLARE
    v_admin_id UUID;
BEGIN
    SELECT id INTO v_admin_id FROM app_users WHERE username = 'admin';
    
    IF v_admin_id IS NOT NULL THEN
        INSERT INTO audit_logs (user_id, action, details, performed_by)
        VALUES (
            v_admin_id,
            'user_created',
            '{"created_by": "system", "note": "Initial admin setup"}'::jsonb,
            v_admin_id
        );
    END IF;
END $$;
