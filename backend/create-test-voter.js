const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function createTestVoter() {
  try {
    console.log('🔧 Creating test voter account...\n');

    // Check if voter already exists
    const existingVoter = await User.findByEmail('voter@test.com');
    
    if (existingVoter) {
      console.log('✓ Test voter already exists');
      console.log('  Email: voter@test.com');
      console.log('  Password: voter123');
      console.log('  Role: voter');
      console.log('\n✅ You can login with these credentials');
      process.exit(0);
    }

    // Create new voter
    const voter = await User.create({
      name: 'Test Voter',
      email: 'voter@test.com',
      password: 'voter123',
      phone: '1234567890',
      role: 'voter'
    });

    // Mark as verified
    await User.updateVerification(voter.id);

    console.log('✅ Test voter created successfully!\n');
    console.log('📋 Login Credentials:');
    console.log('  Email: voter@test.com');
    console.log('  Password: voter123');
    console.log('  Role: voter');
    console.log('\n🎯 Next Steps:');
    console.log('  1. Logout from admin account');
    console.log('  2. Go to http://localhost:3001/login');
    console.log('  3. Login with voter credentials');
    console.log('  4. You can now vote in elections');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test voter:', error.message);
    process.exit(1);
  }
}

createTestVoter();
