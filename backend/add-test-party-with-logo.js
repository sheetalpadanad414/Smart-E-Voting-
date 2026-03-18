const Party = require('./models/Party');
const fs = require('fs');
const path = require('path');

async function addTestPartyWithLogo() {
  console.log('=== Adding Test Party with Logo ===\n');

  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageBase64, 'base64');
    
    // Ensure directory exists
    const uploadDir = path.join(__dirname, 'uploads/party-logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✓ Created uploads/party-logos directory');
    }
    
    // Save test image
    const filename = `test-party-${Date.now()}.png`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, testImageBuffer);
    console.log(`✓ Created test image: ${filename}`);
    
    // Create party with logo
    const logoPath = `/uploads/party-logos/${filename}`;
    const party = await Party.create({
      name: 'Test Party with Logo',
      logo: logoPath,
      description: 'This is a test party with a logo for testing the logo system'
    });
    
    console.log(`✓ Created party: ${party.name}`);
    console.log(`  ID: ${party.id}`);
    console.log(`  Logo path in DB: ${party.logo}`);
    console.log('');
    
    // Verify by fetching
    const fetchedParty = await Party.findById(party.id);
    console.log('✓ Verified by fetching:');
    console.log(`  Name: ${fetchedParty.name}`);
    console.log(`  Logo URL: ${fetchedParty.logo}`);
    console.log('');
    
    if (fetchedParty.logo && (fetchedParty.logo.startsWith('http://') || fetchedParty.logo.startsWith('https://'))) {
      console.log('✅ SUCCESS: Logo is returned as full URL!');
    } else {
      console.log('❌ ERROR: Logo is not a full URL');
    }
    
    console.log('\n=== Test Party Added Successfully ===');
    console.log('You can now test the logo system in the frontend:');
    console.log('1. Go to http://localhost:3001/admin/parties');
    console.log('2. You should see "Test Party with Logo" with an image');
    console.log('3. Try uploading a real logo for this party');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

addTestPartyWithLogo();
