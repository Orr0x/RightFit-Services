/**
 * Create Service Provider for CleanCo Tenant
 *
 * The web-cleaning app references 'sp-cleaning-test' as the service provider ID.
 * This script creates that service provider record linked to the CleanCo tenant.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CLEANCO_TENANT_ID = 'tenant-cleaning-test';
const SERVICE_PROVIDER_ID = 'sp-cleaning-test';

async function createServiceProvider() {
  try {
    console.log('🔧 Creating CleanCo Service Provider...\n');

    // Check if CleanCo tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: CLEANCO_TENANT_ID }
    });

    if (!tenant) {
      console.error('❌ CleanCo tenant not found!');
      console.log('   Expected tenant ID:', CLEANCO_TENANT_ID);
      console.log('   Run create-test-users.js first to create test tenants.');
      process.exit(1);
    }

    console.log('✓ Found CleanCo tenant:', tenant.tenant_name);

    // Check if service provider already exists
    let serviceProvider = await prisma.serviceProvider.findUnique({
      where: { id: SERVICE_PROVIDER_ID }
    });

    if (serviceProvider) {
      console.log('\n⚠ Service provider already exists');
      console.log('   ID:', serviceProvider.id);
      console.log('   Business Name:', serviceProvider.business_name);
      console.log('   Tenant:', serviceProvider.tenant_id);

      if (serviceProvider.tenant_id !== CLEANCO_TENANT_ID) {
        console.log('\n   Updating to CleanCo tenant...');
        serviceProvider = await prisma.serviceProvider.update({
          where: { id: SERVICE_PROVIDER_ID },
          data: {
            tenant_id: CLEANCO_TENANT_ID,
            business_name: 'CleanCo Services',
            owner_name: 'Sarah Johnson',
            email: 'admin@cleaningco.test',
            phone: '+44 20 7123 4567',
            address: '123 Cleaning Street, London, SW1A 1AA, United Kingdom',
          }
        });
        console.log('   ✓ Updated service provider');
      } else {
        console.log('   ✓ Already linked to CleanCo tenant - no changes needed');
      }
    } else {
      console.log('\n📝 Creating service provider...');
      serviceProvider = await prisma.serviceProvider.create({
        data: {
          id: SERVICE_PROVIDER_ID,
          tenant_id: CLEANCO_TENANT_ID,
          business_name: 'CleanCo Services',
          owner_name: 'Sarah Johnson',
          email: 'admin@cleaningco.test',
          phone: '+44 20 7123 4567',
          address: '123 Cleaning Street, London, SW1A 1AA, United Kingdom',
        }
      });
      console.log('   ✓ Created service provider');
    }

    console.log('\n✅ Configuration Complete!');
    console.log('\n📋 Service Provider Details:');
    console.log('   ID:', serviceProvider.id);
    console.log('   Business Name:', serviceProvider.business_name);
    console.log('   Email:', serviceProvider.email);
    console.log('   Tenant:', tenant.tenant_name);
    console.log('\n🔐 Login Credentials:');
    console.log('   Email: admin@cleaningco.test');
    console.log('   Password: TestPassword123!');
    console.log('\n✅ The web-cleaning app should now work correctly!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createServiceProvider();
