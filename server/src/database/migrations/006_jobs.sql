-- ============================================================================
-- Migration 006: Job Management Tables (Architecture Task 2)
-- PRD §11-13: Job Assignment, Completion & Approval Workflow
-- ============================================================================

-- === Jobs ===
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id),
  service_category_id UUID REFERENCES service_categories(id),
  status VARCHAR(50) DEFAULT 'pending',
  scheduled_date TIMESTAMP,
  completed_date TIMESTAMP,
  estimated_cost DECIMAL(10,2),
  final_cost DECIMAL(10,2),
  description TEXT,
  work_summary TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jobs_issue ON jobs(issue_id);
CREATE INDEX idx_jobs_property ON jobs(property_id);
CREATE INDEX idx_jobs_vendor ON jobs(vendor_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- === Job Assignments ===
CREATE TABLE IF NOT EXISTS job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT
);

-- === Job Status History ===
CREATE TABLE IF NOT EXISTS job_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX idx_job_history_job ON job_status_history(job_id);

-- === Job Photos (Completion Photos - PRD §12) ===
CREATE TABLE IF NOT EXISTS job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  caption TEXT,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_job_photos_job ON job_photos(job_id);

-- === Job Comments ===
CREATE TABLE IF NOT EXISTS job_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_job_comments_job ON job_comments(job_id);

-- === Job Cost Estimates ===
CREATE TABLE IF NOT EXISTS job_cost_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id),
  estimated_cost DECIMAL(10,2) NOT NULL,
  description TEXT,
  submitted_at TIMESTAMP DEFAULT NOW()
);
