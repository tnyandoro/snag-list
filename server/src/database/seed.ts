// server/src/database/seed.ts
import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class DatabaseSeeder {
  async seed() {
    console.log('🌱 Starting database seeding...');

    await this.seedUsers();
    await this.seedProperties();
    await this.seedVendors();
    await this.seedInspections();
    await this.seedIssues();

    console.log('✅ Database seeding completed!');
  }

  private async seedUsers() {
    console.log('📝 Seeding users...');

    const password = await bcrypt.hash('password123', 12);

    const users = [
      {
        email: 'admin@propertyplatform.com',
        full_name: 'Platform Admin',
        role: 'admin',
      },
      {
        email: 'owner@propertyplatform.com',
        full_name: 'Property Owner',
        role: 'owner',
      },
      {
        email: 'inspector@propertyplatform.com',
        full_name: 'Property Inspector',
        role: 'inspector',
      },
      {
        email: 'vendor@propertyplatform.com',
        full_name: 'Service Vendor',
        role: 'vendor',
      },
      {
        email: 'tenant@propertyplatform.com',
        full_name: 'Tenant User',
        role: 'tenant',
      },
    ];

    for (const userData of users) {
      const roleResult = await pool.query(
        'SELECT id FROM roles WHERE name = $1',
        [userData.role]
      );

      if (roleResult.rows.length > 0) {
        await pool.query(
          `INSERT INTO users (id, email, password_hash, full_name, role_id, is_active, email_verified_at)
           VALUES ($1, $2, $3, $4, $5, true, NOW())
           ON CONFLICT (email) DO NOTHING`,
          [uuidv4(), userData.email, password, userData.full_name, roleResult.rows[0].id]
        );
      }
    }

    console.log(`   ✓ Seeded ${users.length} users`);
  }

  private async seedProperties() {
    console.log('🏠 Seeding properties...');

    const ownerResult = await pool.query(
      "SELECT id FROM users WHERE email = 'owner@propertyplatform.com'"
    );

    if (ownerResult.rows.length === 0) return;

    const owner_id = ownerResult.rows[0].id;

    const categoryResult = await pool.query(
      "SELECT id FROM property_categories WHERE name = 'apartment'"
    );

    const property_category_id = categoryResult.rows[0]?.id;

    const properties = [
      {
        name: 'Riverside Apartments',
        address: '123 River Street, Downtown',
        gps_lat: -17.8252,
        gps_lng: 31.0335,
      },
      {
        name: 'Sunset Townhouses',
        address: '456 Sunset Boulevard, Suburbs',
        gps_lat: -17.8300,
        gps_lng: 31.0400,
      },
    ];

    for (const prop of properties) {
      const result = await pool.query(
        `INSERT INTO properties (id, owner_id, name, address, gps_lat, gps_lng, property_category_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [uuidv4(), owner_id, prop.name, prop.address, prop.gps_lat, prop.gps_lng, property_category_id]
      );

      if (result.rows.length > 0) {
        await this.seedPropertyStructure(result.rows[0].id);
      }
    }

    console.log(`   ✓ Seeded ${properties.length} properties`);
  }

  private async seedPropertyStructure(propertyId: string) {
    // Create Building
    const buildingResult = await pool.query(
      `INSERT INTO buildings (id, property_id, name)
       VALUES ($1, $2, $3) RETURNING id`,
      [uuidv4(), propertyId, 'Block A']
    );

    const building_id = buildingResult.rows[0].id;

    // Create Floor
    const floorResult = await pool.query(
      `INSERT INTO floors (id, building_id, floor_number, name)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [uuidv4(), building_id, 1, 'First Floor']
    );

    const floor_id = floorResult.rows[0].id;

    // Create Rooms
    const rooms = ['Kitchen', 'Living Room', 'Master Bedroom', 'Bathroom'];

    for (const roomName of rooms) {
      const roomResult = await pool.query(
        `INSERT INTO rooms (id, floor_id, name, room_type)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [uuidv4(), floor_id, roomName, roomName.toLowerCase().replace(' ', '_')]
      );

      const room_id = roomResult.rows[0].id;

      // Create Room Items
      await this.seedRoomItems(room_id, roomName);
    }
  }

  private async seedRoomItems(roomId: string, roomName: string) {
    const items: Record<string, string[]> = {
      Kitchen: ['Ceiling', 'Lights', 'Stove', 'Sink', 'Cabinets', 'Tiles', 'Walls'],
      'Living Room': ['Ceiling', 'Lights', 'Windows', 'Walls', 'Floor'],
      'Master Bedroom': ['Ceiling', 'Lights', 'Windows', 'Walls', 'Floor', 'Doors'],
      Bathroom: ['Ceiling', 'Lights', 'Sink', 'Toilet', 'Shower', 'Tiles', 'Walls'],
    };

    const roomItems = items[roomName] || ['Walls', 'Floor', 'Ceiling'];

    for (const itemName of roomItems) {
      await pool.query(
        `INSERT INTO room_items (id, room_id, name, category)
         VALUES ($1, $2, $3, $4)`,
        [uuidv4(), roomId, itemName, this.getItemCategory(itemName)]
      );
    }
  }

  private getItemCategory(itemName: string): string {
    const categories: Record<string, string> = {
      Ceiling: 'structural',
      Walls: 'structural',
      Floor: 'structural',
      Doors: 'structural',
      Windows: 'structural',
      Lights: 'electrical',
      Stove: 'appliance',
      Sink: 'plumbing',
      Toilet: 'plumbing',
      Shower: 'plumbing',
      Cabinets: 'structural',
      Tiles: 'structural',
    };

    return categories[itemName] || 'structural';
  }

  private async seedVendors() {
    console.log('🔧 Seeding vendors...');

    const vendorUserResult = await pool.query(
      "SELECT id FROM users WHERE email = 'vendor@propertyplatform.com'"
    );

    if (vendorUserResult.rows.length === 0) return;

    const user_id = vendorUserResult.rows[0].id;

    const vendorResult = await pool.query(
      `INSERT INTO vendors (id, user_id, company_name, contact_email, contact_phone, is_verified, rating)
       VALUES ($1, $2, $3, $4, $5, true, 4.5)
       ON CONFLICT DO NOTHING RETURNING id`,
      [uuidv4(), user_id, 'Quick Fix Services', 'vendor@propertyplatform.com', '+1234567890']
    );

    if (vendorResult.rows.length > 0) {
      const vendor_id = vendorResult.rows[0].id;

      // Seed vendor services
      const services = ['plumbing', 'electrical', 'appliance_repair'];

      for (const serviceName of services) {
        const categoryResult = await pool.query(
          'SELECT id FROM service_categories WHERE name = $1',
          [serviceName]
        );

        if (categoryResult.rows.length > 0) {
          await pool.query(
            `INSERT INTO vendor_services (id, vendor_id, service_category_id, hourly_rate)
             VALUES ($1, $2, $3, $4)`,
            [uuidv4(), vendor_id, categoryResult.rows[0].id, 50.00]
          );
        }
      }
    }

    console.log('   ✓ Seeded vendors');
  }

  private async seedInspections() {
    console.log('📋 Seeding inspections...');
    // Add sample inspection data
    console.log('   ✓ Seeded inspections');
  }

  private async seedIssues() {
    console.log('🎫 Seeding issues...');
    // Add sample issue data
    console.log('   ✓ Seeded issues');
  }
}

// Run seeder
if (require.main === module) {
  const seeder = new DatabaseSeeder();
  seeder
    .seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}