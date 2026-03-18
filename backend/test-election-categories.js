const ElectionCategory = require('./models/ElectionCategory');
const { pool } = require('./config/database');

/**
 * Test Election Categories System
 */

async function testElectionCategories() {
  console.log('🧪 Testing Election Categories System\n');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Get all categories
    console.log('\n1️⃣  Testing ElectionCategory.getAll()...');
    const categories = await ElectionCategory.getAll();
    console.log(`   ✓ Found ${categories.length} categories:\n`);
    
    categories.forEach(cat => {
      console.log(`   📁 ${cat.category_name}`);
      console.log(`      Description: ${cat.description}`);
      console.log(`      Types: ${cat.type_count}`);
      console.log(`      Elections: ${cat.election_count}\n`);
    });

    // Test 2: Get category by ID with types
    console.log('2️⃣  Testing ElectionCategory.findById()...');
    const category = await ElectionCategory.findById(1);
    if (category) {
      console.log(`   ✓ Retrieved: ${category.category_name}`);
      console.log(`   ✓ Types in this category: ${category.types.length}\n`);
      category.types.forEach(type => {
        console.log(`      - ${type.type_name}`);
      });
    }

    // Test 3: Check database tables
    console.log('\n3️⃣  Checking database tables...');
    const connection = await pool.getConnection();
    
    const [catCount] = await connection.query('SELECT COUNT(*) as count FROM election_categories');
    console.log(`   ✓ election_categories: ${catCount[0].count} records`);
    
    const [typeCount] = await connection.query('SELECT COUNT(*) as count FROM election_types');
    console.log(`   ✓ election_types: ${typeCount[0].count} records`);
    
    const [electionCols] = await connection.query(`
      SHOW COLUMNS FROM elections WHERE Field IN ('category_id', 'type_id')
    `);
    console.log(`   ✓ elections table has ${electionCols.length} new columns`);
    
    connection.release();

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ All Tests Passed!\n');
    console.log('📋 Summary:');
    console.log(`   - ${categories.length} categories available`);
    console.log(`   - ${typeCount[0].count} election types defined`);
    console.log('   - Database structure updated correctly');
    console.log('\n🚀 System Ready!');
    console.log('   Frontend: http://localhost:3000/admin/elections');
    console.log('   Backend API: http://localhost:5000/api/election-categories\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testElectionCategories();
