-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create user level enum
DO $$ BEGIN
    CREATE TYPE user_level AS ENUM ('admin', 'regular');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create app_users table
CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    user_level user_level NOT NULL DEFAULT 'regular',
    restrictions JSONB DEFAULT '{
        "can_add_users": false,
        "can_edit_users": false,
        "can_view_logs": false,
        "can_manage_roles": false
    }'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_locked BOOLEAN DEFAULT false,
    failed_attempts INTEGER DEFAULT 0,
    password_changed_at TIMESTAMPTZ DEFAULT NOW(),
    password_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_app_users_username ON app_users(username);
CREATE INDEX IF NOT EXISTS idx_app_users_is_active ON app_users(is_active);
CREATE INDEX IF NOT EXISTS idx_app_users_is_locked ON app_users(is_locked);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Attach trigger to app_users
DROP TRIGGER IF EXISTS update_app_users_updated_at ON app_users;
CREATE TRIGGER update_app_users_updated_at
    BEFORE UPDATE ON app_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
