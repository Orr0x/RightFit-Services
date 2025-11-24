require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔍 Checking database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Check if tenant exists
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      console.log('📝 Creating test tenant...');
      tenant = await prisma.tenant.create({
        data: {
          tenant_name: 'Test Tenant',
          subscription_status: 'ACTIVE'
        }
      });
      console.log('✅ Test tenant created:', tenant.id);
    }

    // Check if test user exists
    const existingUser = await prisma.user.findFirst({
      where: { email: 'worker@rightfit.com' }
    });

    if (existingUser) {
      console.log('👤 Test user already exists:', existingUser.email);
      console.log('🔑 User ID:', existingUser.id);
      console.log('🏢 Tenant ID:', existingUser.tenant_id);
    } else {
      console.log('📝 Creating test user...');
      const hashedPassword = await bcrypt.hash('password123', 10);

      const newUser = await prisma.user.create({
        data: {
          tenant_id: tenant.id,
          email: 'worker@rightfit.com',
          password_hash: hashedPassword,
          full_name: 'Test Worker',
          role: 'MEMBER' // Changed from 'CONTRACTOR' to 'MEMBER' based on schema
        }
      });
      console.log('✅ Test user created:', newUser.email);
      console.log('🔑 User ID:', newUser.id);
      console.log('🏢 Tenant ID:', newUser.tenant_id);
    }

    // Generate JWT token
    const user = existingUser || (await prisma.user.findFirst({
      where: { email: 'worker@rightfit.com' }
    }));

    if (user) {
      const token = jwt.sign(
        {
          user_id: user.id,
          tenant_id: user.tenant_id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('🎫 Generated JWT Token:');
      console.log(token);
      console.log('');
      console.log('📋 Test API Calls:');
      console.log('curl -H "Authorization: Bearer ' + token + '" http://localhost:3001/api/workers/me');
      console.log('');
      console.log('💡 Open your browser and use this token in the Authorization header');
      console.log('Or test with this command:');
      console.log('curl -H "Authorization: Bearer ' + token + '" http://localhost:3001/api/workers/me | jq');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();