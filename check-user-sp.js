const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserAndSP() {
  try {
    // Find the user
    const user = await prisma.users.findUnique({
      where: { id: '31f9bfa9-2a26-4139-9eb8-b222e4e6adb0' },
      include: { tenant: true }
    });
    console.log('=== Current User ===');
    console.log('ID:', user?.id);
    console.log('Email:', user?.email);
    console.log('Name:', user?.full_name);
    console.log('Role:', user?.role);
    console.log('Tenant:', user?.tenant?.tenant_name);
    console.log('Tenant ID:', user?.tenant_id);

    // Find the service provider being accessed
    const sp = await prisma.service_providers.findUnique({
      where: { id: '8aeb5932-907c-41b3-a2bc-05b27ed0dc87' },
      include: { tenant: true }
    });
    console.log('\n=== Target Service Provider (Hardcoded in App) ===');
    console.log('ID:', sp?.id);
    console.log('Business Name:', sp?.business_name);
    console.log('Tenant:', sp?.tenant?.tenant_name);
    console.log('Tenant ID:', sp?.tenant_id);

    // Find all service providers to see what's available
    console.log('\n=== All Service Providers ===');
    const allSPs = await prisma.service_providers.findMany({
      include: { tenant: true },
      orderBy: { business_name: 'asc' }
    });
    allSPs.forEach(sp => {
      console.log(`- ${sp.business_name} (ID: ${sp.id}, Tenant: ${sp.tenant?.tenant_name})`);
    });

    // Check if user's tenant has a service provider
    if (user?.tenant_id) {
      const userSP = await prisma.service_providers.findFirst({
        where: { tenant_id: user.tenant_id }
      });
      console.log('\n=== User Tenant Service Provider ===');
      if (userSP) {
        console.log('Found:', userSP.business_name, '(ID:', userSP.id + ')');
      } else {
        console.log('No service provider found for user tenant');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserAndSP();
