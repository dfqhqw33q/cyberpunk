-- Create a regular test user for testing non-admin functionality
-- Username: testuser
-- Password: TestUser@2025!

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
    'testuser',
    crypt('TestUser@2025!', gen_salt('bf', 12)),
    'regular',
    '{
        "can_add_users": false,
        "can_edit_users": false,
        "can_view_logs": false,
        "can_manage_roles": false
    }'::jsonb,
    true,
    false,
    0,
    NOW(),
    NOW() + INTERVAL '90 days'
)
ON CONFLICT (username) DO NOTHING;

-- Log the test user creation
DO $$
DECLARE
    v_user_id UUID;
    v_admin_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM app_users WHERE username = 'testuser';
    SELECT id INTO v_admin_id FROM app_users WHERE username = 'admin';
    
    IF v_user_id IS NOT NULL THEN
        INSERT INTO audit_logs (user_id, action, details, performed_by)
        VALUES (
            v_user_id,
            'user_created',
            '{"created_by": "system", "note": "Test user for regular user functionality testing"}'::jsonb,
            COALESCE(v_admin_id, v_user_id)
        );
    END IF;
END $$;

-- Output confirmation
DO $$
BEGIN
    RAISE NOTICE 'Test user created successfully!';
    RAISE NOTICE 'Username: testuser';
    RAISE NOTICE 'Password: TestUser@2025!';
    RAISE NOTICE 'Role: Regular User';
END $$;
