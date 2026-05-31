/**
 * Script to run the election-specific face data migration
 */
require('dotenv').config();
const { migrate } = require('./migrations/add-election-specific-face-data');

console.log('🚀 Starting election-specific face data migration...\n');

migrate()
  .then(() => {
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Face data will now be stored per election');
    console.log('2. Face data auto-deletes when elections end');
    console.log('3. Cleanup job runs hourly automatically');
    console.log('4. Users must register face for each active election');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  });
