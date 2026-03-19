-- Migration 001: Core Auth Tables (Architecture Task 2)

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Platform administrator with full access'),
  ('owner', 'Property owner who approves jobs and payments'),
  ('tenant', 'Tenant who can view reports and report issues'),
  ('inspector', 'Inspector who performs property inspections'),
  ('vendor', 'Service vendor who completes maintenance jobs')
ON CONFLICT (name) DO NOTHING;

-- Add missing columns to existing users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;

-- Migrate existing text roles to role_id
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE name = LOWER(role))
WHERE role_id IS NULL AND role IS NOT NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
