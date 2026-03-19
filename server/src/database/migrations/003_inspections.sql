-- ============================================================================
-- Migration 003: Inspection Domain Tables (Architecture Task 2)
-- PRD §6-7: Snagging/Inspection Module & Data Capture
-- ============================================================================

-- === Inspection Templates (Reusable Checklists) ===
CREATE TABLE IF NOT EXISTS inspection_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- === Inspections ===
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES users(id),
  inspection_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  signed_at TIMESTAMP,
  notes TEXT,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_inspections_property ON inspections(property_id);
CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);
CREATE INDEX idx_inspections_status ON inspections(status);

-- === Inspection Sessions (For Mobile Offline Sync - Task 3) ===
CREATE TABLE IF NOT EXISTS inspection_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  device_id VARCHAR(100),
  sync_status VARCHAR(50) DEFAULT 'pending',
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- === Inspection Items ===
CREATE TABLE IF NOT EXISTS inspection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  room_item_id UUID REFERENCES room_items(id),
  status VARCHAR(50) NOT NULL,
  comment TEXT,
  severity VARCHAR(20),
  repair_recommendation TEXT,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_inspection_items_inspection ON inspection_items(inspection_id);
CREATE INDEX idx_inspection_items_status ON inspection_items(status);

-- === Inspection Item Photos ===
CREATE TABLE IF NOT EXISTS inspection_item_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_item_id UUID REFERENCES inspection_items(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  caption TEXT,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_inspection_photos_item ON inspection_item_photos(inspection_item_id);

-- === Inspection Notes (Voice-to-Text Support - Task 3) ===
CREATE TABLE IF NOT EXISTS inspection_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  voice_note_url VARCHAR(500),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- === Inspection Signatures (Digital Signature - Task 3 Step 6) ===
CREATE TABLE IF NOT EXISTS inspection_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  signer_id UUID REFERENCES users(id),
  signer_name VARCHAR(255) NOT NULL,
  signer_role VARCHAR(50) NOT NULL,
  signature_data TEXT,
  signed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_inspection_signatures_inspection ON inspection_signatures(inspection_id);
