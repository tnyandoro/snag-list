-- ============================================================================
-- Migration 008: Reports & Notifications (Architecture Task 2)
-- PRD §16-17: Reporting Module & Document Generation
-- PRD §19: Notification System
-- ============================================================================

-- === Reports ===
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  generated_by UUID REFERENCES users(id),
  file_url VARCHAR(500),
  file_format VARCHAR(20) DEFAULT 'pdf',
  meta_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_generated_by ON reports(generated_by);

-- === Report Exports ===
CREATE TABLE IF NOT EXISTS report_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  format VARCHAR(20) NOT NULL,
  url VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- === System Metrics (Analytics) ===
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,2),
  metric_type VARCHAR(50),
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX idx_system_metrics_recorded ON system_metrics(recorded_at);

-- === Notifications ===
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  link VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- === Notification Preferences ===
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  ticket_assigned BOOLEAN DEFAULT true,
  ticket_completed BOOLEAN DEFAULT true,
  inspection_scheduled BOOLEAN DEFAULT true,
  payment_approved BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- === Notification Logs (Audit Trail - PRD §15) ===
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  channel VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
