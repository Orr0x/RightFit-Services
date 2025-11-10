const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://rightfit_user:rightfit_dev_password@localhost:5433/rightfit_dev?schema=public'
    }
  }
});

async function createMaintenanceQuoteTable() {
  try {
    console.log('Creating maintenance_quotes table...');

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS maintenance_quotes (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        property_id TEXT,
        maintenance_job_id TEXT,
        quote_number VARCHAR(50) UNIQUE NOT NULL,
        quote_date DATE NOT NULL,
        valid_until_date DATE NOT NULL,
        line_items JSONB NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        discount_percentage DECIMAL(5, 2) DEFAULT 0 NOT NULL,
        discount_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status TEXT DEFAULT 'DRAFT' NOT NULL,
        customer_response TEXT,
        approved_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (property_id) REFERENCES customer_properties(id)
      );
    `);

    console.log('Creating indexes...');

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS maintenance_quotes_customer_id_idx ON maintenance_quotes(customer_id);
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS maintenance_quotes_property_id_idx ON maintenance_quotes(property_id);
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS maintenance_quotes_status_idx ON maintenance_quotes(status);
    `);

    console.log('✅ maintenance_quotes table created successfully!');

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Table already exists, skipping creation');
    } else {
      console.error('❌ Error creating table:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

createMaintenanceQuoteTable();
