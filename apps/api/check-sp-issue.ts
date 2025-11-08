import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkServiceProviderIssue() {
  try {
    // Find admin@cleaningco.test user
    const user = await prisma.users.findUnique({
      where: { email: 'admin@cleaningco.test' },
      include: { tenant: true }
    });

    console.log('=== Logged In User ===');
    console.log('ID:', user?.id);
    console.log('Email:', user?.email);
    console.log('Tenant:', user?.tenant?.tenant_name);
    console.log('Tenant ID:', user?.tenant_id);

    // Find service provider for CleanCo tenant
    const cleanCoSP = await prisma.service_providers.findFirst({
      where: { tenant_id: user?.tenant_id }
    });

    console.log('\n=== CleanCo Service Provider ===');
    if (cleanCoSP) {
      console.log('✓ FOUND');
      console.log('  ID:', cleanCoSP.id);
      console.log('  Business Name:', cleanCoSP.business_name);
    } else {
      console.log('✗ NOT FOUND - This tenant has no service provider!');
    }

    // Find the hardcoded service provider in the app
    const hardcodedSP = await prisma.service_providers.findUnique({
      where: { id: '8aeb5932-907c-41b3-a2bc-05b27ed0dc87' },
      include: { tenant: true }
    });

    console.log('\n=== Hardcoded Service Provider (from app) ===');
    if (hardcodedSP) {
      console.log('✓ EXISTS');
      console.log('  ID:', hardcodedSP.id);
      console.log('  Business Name:', hardcodedSP.business_name);
      console.log('  Tenant:', hardcodedSP.tenant?.tenant_name);
      console.log('  Tenant ID:', hardcodedSP.tenant_id);
    } else {
      console.log('✗ NOT FOUND');
    }

    // Check if they match
    console.log('\n=== Analysis ===');
    if (cleanCoSP && hardcodedSP) {
      if (cleanCoSP.id === hardcodedSP.id) {
        console.log('✓ Service providers MATCH - App should work!');
      } else {
        console.log('✗ MISMATCH - User tenant SP:', cleanCoSP.id);
        console.log('            App hardcoded SP:', hardcodedSP.id);
        console.log('\nSOLUTION: Either:');
        console.log('  1. Create a service provider for CleanCo tenant');
        console.log('  2. OR update app to use correct service provider ID');
      }
    } else if (!cleanCoSP) {
      console.log('✗ CleanCo tenant has NO service provider!');
      console.log('   Need to create service provider for tenant:', user?.tenant_id);
    }

  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkServiceProviderIssue();
