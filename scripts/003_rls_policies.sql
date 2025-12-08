-- Enable Row Level Security on tables
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all users" ON app_users;
DROP POLICY IF EXISTS "Users can view own record" ON app_users;
DROP POLICY IF EXISTS "Admins can insert users" ON app_users;
DROP POLICY IF EXISTS "Admins can update all users" ON app_users;
DROP POLICY IF EXISTS "Users can update own record" ON app_users;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON audit_logs;

-- App Users Policies
-- Admins can view all users
CREATE POLICY "Admins can view all users" ON app_users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM app_users au 
            WHERE au.id = auth.uid() 
            AND au.user_level = 'admin'
        )
        OR id = auth.uid()
    );

-- Admins can insert users
CREATE POLICY "Admins can insert users" ON app_users
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app_users au 
            WHERE au.id = auth.uid() 
            AND au.user_level = 'admin'
        )
    );

-- Admins can update all users, regular users can only update their own
CREATE POLICY "Admins can update all users" ON app_users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM app_users au 
            WHERE au.id = auth.uid() 
            AND au.user_level = 'admin'
        )
    );

CREATE POLICY "Users can update own record" ON app_users
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Audit Logs Policies
-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM app_users au 
            WHERE au.id = auth.uid() 
            AND au.user_level = 'admin'
            AND (au.restrictions->>'can_view_logs')::boolean = true
        )
    );

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT
    USING (user_id = auth.uid());

-- Allow insert for audit logs (service role)
CREATE POLICY "Service role can insert audit logs" ON audit_logs
    FOR INSERT
    WITH CHECK (true);
