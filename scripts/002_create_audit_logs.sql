-- Create audit action enum
DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM (
        'login_success',
        'login_failed',
        'account_locked',
        'account_unlocked',
        'password_reset',
        'password_changed',
        'user_created',
        'user_updated',
        'user_activated',
        'user_deactivated',
        'credentials_changed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    action audit_action NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    performed_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs(performed_by);
