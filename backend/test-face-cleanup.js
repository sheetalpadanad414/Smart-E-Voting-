/**
 * Test script for face data cleanup functionality
 */
require('dotenv').config();
const ElectionFaceService = require('./services/electionFaceService');

async function testCleanup() {
  console.log('🧪 Testing Face Data Cleanup System\n');
  
  try {
    // Get current statistics
    console.log('📊 Current Statistics:');
    const statsBefore = await ElectionFaceService.getFaceRegistrationStats();
    console.log('   Active Elections:', statsBefore.activeElections);
    console.log('   Total Registrations:', statsBefore.totalRegistrations);
    console.log('   By Election Type:', statsBefore.byElectionType);
    console.log('');
    
    // Run cleanup
    console.log('🧹 Running cleanup...');
    const result = await ElectionFaceService.cleanupInactiveElectionFaceData();
    console.log('   Elections Processed:', result.electionsProcessed);
    console.log('   Records Deleted:', result.recordsDeleted);
    console.log('');
    
    // Get updated statistics
    console.log('📊 Updated Statistics:');
    const statsAfter = await ElectionFaceService.getFaceRegistrationStats();
    console.log('   Active Elections:', statsAfter.activeElections);
    console.log('   Total Registrations:', statsAfter.totalRegistrations);
    console.log('   By Election Type:', statsAfter.byElectionType);
    console.log('');
    
    // Show recent cleanup logs
    console.log('📝 Recent Cleanup Logs:');
    if (statsAfter.recentCleanups.length > 0) {
      statsAfter.recentCleanups.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.election_title} (${log.election_type})`);
        console.log(`      Records Deleted: ${log.records_deleted}`);
        console.log(`      Reason: ${log.cleanup_reason}`);
        console.log(`      Date: ${log.cleaned_at}`);
      });
    } else {
      console.log('   No cleanup logs found');
    }
    
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testCleanup();
