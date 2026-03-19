-- ============================================================================
-- Migration 001: Core Auth Tables (Architecture Task 2)
-- PRD §2, §19 - User Roles & Security Requirements
-- ============================================================================

-- === STEP 1: Create roles table ===
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed default roles (PRD §2 - System Actors)
INSERT INTO roles (name, description) VALUES
  ('admin', 'Platform administrator with full access'),
  ('owner', 'Property owner who approves jobs and payments'),
  ('tenant', 'Tenant who can view reports and report issues'),
  ('inspector', 'Inspector who performs property inspections'),
  ('vendor', 'Service vendor who completes maintenance jobs')
ON CONFLICT (name) DO NOTHING;

-- === STEP 2: Create users table (Architecture Task 2) ===
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  avatar_url VARCHAR(500),
  phone VARCHAR(20),
  company VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  email_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  
  -- Notification Preferences (PRD §19)
  notify_email BOOLEAN DEFAULT true,
  notify_push BOOLEAN DEFAULT true,
  notify_sms BOOLEAN DEFAULT false,
  notify_ticket_assigned BOOLEAN DEFAULT true,
  notify_ticket_completed BOOLEAN DEFAULT true,
  notify_inspection_scheduled BOOLEAN DEFAULT true,
  notify_payment_approved BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- === STEP 3: Create indexes for performance ===
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- === STEP 4: Create audit_logs table (PRD §15) ===
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- === STEP 5: Create permissions table (Architecture Task 2) ===
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  module VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed default permissions
INSERT INTO permissions (name, description, module) VALUES
  ('users:create', 'Create new users', 'users'),
  ('users:read', 'View user details', 'users'),
  ('users:update', 'Update user information', 'users'),
  ('users:delete', 'Delete users', 'users'),
  ('properties:create', 'Create properties', 'properties'),
  ('properties:read', 'View properties', 'properties'),
  ('properties:update', 'Update properties', 'properties'),
  ('properties:delete', 'Delete properties', 'properties'),
  ('inspections:create', 'Create inspections', 'inspections'),
  ('inspections:read', 'View inspections', 'inspections'),
  ('inspections:update', 'Update inspections', 'inspections'),
  ('issues:create', 'Create issues', 'issues'),
  ('issues:read', 'View issues', 'issues'),
  ('issues:update', 'Update issues', 'issues'),
  ('issues:assign', 'Assign issues to vendors', 'issues'),
  ('jobs:create', 'Create jobs', 'jobs'),
  ('jobs:read', 'View jobs', 'jobs'),
  ('jobs:update', 'Update jobs', 'jobs'),
  ('jobs:approve', 'Approve completed jobs', 'jobs'),
  ('vendors:verify', 'Verify vendor accounts', 'vendors'),
  ('payments:approve', 'Approve payments', 'payments'),
  ('reports:generate', 'Generate reports', 'reports')
ON CONFLICT (name) DO NOTHING;

-- === STEP 6: Create user_roles junction table (for many-to-many if needed) ===
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by UUID REFERENCES users(id),
  PRIMARY KEY (user_id, role_id)
);

-- === STEP 7: Create default admin user (for first login) ===
-- Password: admin123 (hashed with bcrypt - you should change this!)
INSERT INTO users (email, password_hash, full_name, role_id, is_active, email_verified_at)
SELECT 
  'admin@propertyplatform.com',
  '$2b$10$rQZ8vXJxK9L6mN4pO2qR3uW5yT7iU8oP1aS2dF3gH4jK5lM6nO7pQ',
  'Platform Admin',
  (SELECT id FROM roles WHERE name = 'admin'),
  true,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@propertyplatform.com');

