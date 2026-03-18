const Party = require('./models/Party');

async function addPartiesWithURLs() {
  console.log('=== Adding Parties with Logo URLs ===\n');

  const parties = [
    {
      name: 'Indian National Congress',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Indian_National_Congress_hand_logo.png/150px-Indian_National_Congress_hand_logo.png',
      description: 'Indian National Congress (INC) is a political party in India with widespread roots.'
    },
    {
      name: 'Bharatiya Janata Party',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Bharatiya_Janata_Party_logo.svg/150px-Bharatiya_Janata_Party_logo.svg.png',
      description: 'Bharatiya Janata Party (BJP) is one of the two major political parties in India.'
    },
    {
      name: 'Aam Aadmi Party',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6a/Aam_Aadmi_Party_logo_%28English%29.svg/150px-Aam_Aadmi_Party_logo_%28English%29.svg.png',
      description: 'Aam Aadmi Party (AAP) is a political party in India, founded in 2012.'
    }
  ];

  try {
    for (const partyData of parties) {
      try {
        const party = await Party.create(partyData);
        console.log(`✓ Created: ${party.name}`);
        console.log(`  Logo: ${party.logo}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⊘ Skipped: ${partyData.name} (already exists)`);
        } else {
          console.log(`✗ Error: ${partyData.name} - ${error.message}`);
        }
      }
    }

    console.log('\n=== Parties Added Successfully ===');
    console.log('You can now view them at: http://localhost:3001/admin/parties');
    console.log('\nLogos are loaded from Wikipedia (direct URLs)');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

addPartiesWithURLs();
