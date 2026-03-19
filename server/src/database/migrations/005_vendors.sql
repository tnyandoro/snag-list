-- ============================================================================
-- Migration 005: Vendor Marketplace Tables (Architecture Task 2 & 5)
-- PRD §9-10: Vendor Management & Service Categories
-- ============================================================================

-- === Service Categories ===
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO service_categories (name, description) VALUES
  ('plumbing', 'Pipe repairs, installations, leaks'),
  ('electrical', 'Wiring, lighting, electrical repairs'),
  ('carpentry', 'Woodwork, furniture, doors'),
  ('appliance_repair', 'Appliance fixing and maintenance'),
  ('painting', 'Interior and exterior painting'),
  ('roofing', 'Roof repairs and installations'),
  ('garden_maintenance', 'Landscaping and garden care'),
  ('pest_control', 'Pest elimination and prevention'),
  ('cleaning', 'Professional cleaning services')
ON CONFLICT (name) DO NOTHING;

-- === Vendors ===
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES users(id),
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_jobs INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vendors_user ON vendors(user_id);
CREATE INDEX idx_vendors_verified ON vendors(is_verified);

-- === Vendor Profiles ===
CREATE TABLE IF NOT EXISTS vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  certifications TEXT[],
  insurance_details TEXT,
  business_license VARCHAR(255),
  portfolio_images TEXT[],
  years_of_experience INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- === Vendor Services ===
CREATE TABLE IF NOT EXISTS vendor_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  service_category_id UUID REFERENCES service_categories(id),
  description TEXT,
  hourly_rate DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vendor_services_vendor ON vendor_services(vendor_id);

-- === Service Areas ===
CREATE TABLE IF NOT EXISTS service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  city VARCHAR(100),
  region VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20)
);

CREATE INDEX idx_service_areas_vendor ON service_areas(vendor_id);

-- === Vendor Documents ===
CREATE TABLE IF NOT EXISTS vendor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  url VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- === Vendor Ratings & Reviews (Task 5 - Ranking Algorithm) ===
CREATE TABLE IF NOT EXISTS vendor_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vendor_ratings_vendor ON vendor_ratings(vendor_id);

-- === Vendor Reviews ===
CREATE TABLE IF NOT EXISTS vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  job_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  response TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vendor_reviews_vendor ON vendor_reviews(vendor_id);
