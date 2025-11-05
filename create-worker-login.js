// Script to create a login account for a worker
// Usage: node create-worker-login.js

const { PrismaClient } = require('@rightfit/database');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createWorkerLogin() {
  try {
    // Worker details
    const workerEmail = 'kerradeth@gmail.com';
    const password = 'password123'; // Simple password for testing

    // Find the worker by email
    const worker = await prisma.worker.findFirst({
      where: {
        email: workerEmail,
      },
      include: {
        service_provider: true,
      },
    });

    if (!worker) {
      console.error('❌ Worker not found with email:', workerEmail);
      console.log('Please check the email address and try again.');
      process.exit(1);
    }

    console.log('✅ Found worker:', worker.first_name, worker.last_name);
    console.log('📧 Email:', worker.email);
    console.log('🏢 Service Provider:', worker.service_provider.business_name);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: workerEmail.toLowerCase() },
    });

    if (existingUser) {
      console.log('⚠️  User account already exists for this email');
      console.log('You can login with:');
      console.log('  Email:', workerEmail);
      console.log('  Password: (your existing password or reset it)');
      process.exit(0);
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user account
    const user = await prisma.user.create({
      data: {
        tenant_id: worker.service_provider.tenant_id,
        email: workerEmail.toLowerCase(),
        password_hash,
        full_name: `${worker.first_name} ${worker.last_name}`,
        role: 'MEMBER', // Using MEMBER role for workers
      },
    });

    console.log('');
    console.log('✅ SUCCESS! Worker login account created!');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('  Email:', workerEmail);
    console.log('  Password:', password);
    console.log('');
    console.log('🌐 Login URL:');
    console.log('  http://localhost:5178/login');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('');

  } catch (error) {
    console.error('❌ Error creating worker login:', error);
    if (error.code === 'P2002') {
      console.log('User with this email already exists.');
    } else {
      console.error(error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createWorkerLogin();
