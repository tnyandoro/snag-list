-- ============================================================================
-- Migration 004: Issue Management Tables (Architecture Task 2)
-- PRD §8: Issue Tracking & Status Workflow
-- ============================================================================

-- === Issue Categories ===
CREATE TABLE IF NOT EXISTS issue_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO issue_categories (name, description) VALUES
  ('structural', 'Walls, floors, ceilings, foundations'),
  ('electrical', 'Wiring, lights, switches, sockets'),
  ('plumbing', 'Pipes, taps, showers, toilets'),
  ('appliance', 'Stoves, ovens, fridges, AC units'),
  ('exterior', 'Gardens, fences, garages, driveways')
ON CONFLICT (name) DO NOTHING;

-- === Issues ===
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_item_id UUID REFERENCES inspection_items(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  category_id UUID REFERENCES issue_categories(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  assigned_vendor_id UUID REFERENCES users(id),
  priority INTEGER DEFAULT 1,
  due_date TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_issues_property ON issues(property_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_vendor ON issues(assigned_vendor_id);
CREATE INDEX idx_issues_category ON issues(category_id);

-- === Issue Photos ===
CREATE TABLE IF NOT EXISTS issue_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  caption TEXT,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_issue_photos_issue ON issue_photos(issue_id);

-- === Issue Comments ===
CREATE TABLE IF NOT EXISTS issue_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_issue_comments_issue ON issue_comments(issue_id);

-- === Issue Status History (Audit Trail - PRD §15) ===
CREATE TABLE IF NOT EXISTS issue_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX idx_issue_history_issue ON issue_status_history(issue_id);
