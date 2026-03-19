-- ============================================================================
-- Migration 002: Property Domain Tables (Architecture Task 2)
-- PRD §3-5: Property Management & Structure Hierarchy
-- ============================================================================

-- === Property Categories ===
CREATE TABLE IF NOT EXISTS property_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO property_categories (name, description) VALUES
  ('apartment', 'Multi-unit residential building'),
  ('townhouse', 'Multi-floor attached home'),
  ('lodge', 'Vacation or short-term rental property'),
  ('house', 'Standalone residential home')
ON CONFLICT (name) DO NOTHING;

-- === Properties ===
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  property_category_id UUID REFERENCES property_categories(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_category ON properties(property_category_id);
CREATE INDEX idx_properties_location ON properties(gps_lat, gps_lng);

-- === Property Images ===
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_property_images_property ON property_images(property_id);

-- === Property Documents (Titles, Deeds, etc.) ===
CREATE TABLE IF NOT EXISTS property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  url VARCHAR(500) NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- === Buildings ===
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_buildings_property ON buildings(property_id);

-- === Floors ===
CREATE TABLE IF NOT EXISTS floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  floor_number INTEGER NOT NULL,
  name VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_floors_building ON floors(building_id);

-- === Rooms ===
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id UUID REFERENCES floors(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  room_type VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rooms_floor ON rooms(floor_id);
CREATE INDEX idx_rooms_type ON rooms(room_type);

-- === Room Items (Inspectable Items) ===
CREATE TABLE IF NOT EXISTS room_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_room_items_room ON room_items(room_id);
CREATE INDEX idx_room_items_category ON room_items(category);

-- === Item Categories (Standardized) ===
CREATE TABLE IF NOT EXISTS item_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  parent_id UUID REFERENCES item_categories(id),
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO item_categories (name) VALUES
  ('structural'), ('electrical'), ('plumbing'), ('appliance'), ('exterior')
ON CONFLICT (name) DO NOTHING;
