const schedule = require('node-schedule');
const ElectionFaceService = require('../services/electionFaceService');

/**
 * Scheduled job to cleanup face data for inactive elections
 * Runs every hour to check for completed/inactive elections
 */
class FaceDataCleanupJob {
  
  static start() {
    // Run every hour at minute 0
    schedule.scheduleJob('0 * * * *', async () => {
      console.log('🧹 Running face data cleanup job...');
      
      try {
        const result = await ElectionFaceService.cleanupInactiveElectionFaceData();
        
        if (result.recordsDeleted > 0) {
          console.log(`✅ Cleanup completed: ${result.recordsDeleted} records deleted from ${result.electionsProcessed} elections`);
        } else {
          console.log('✓ No face data to cleanup');
        }
      } catch (error) {
        console.error('❌ Face data cleanup job failed:', error);
      }
    });

    console.log('✓ Face data cleanup job scheduled (runs hourly)');
  }

  /**
   * Run cleanup immediately (for testing or manual trigger)
   */
  static async runNow() {
    console.log('🧹 Running face data cleanup manually...');
    
    try {
      const result = await ElectionFaceService.cleanupInactiveElectionFaceData();
      console.log(`✅ Cleanup completed: ${result.recordsDeleted} records deleted from ${result.electionsProcessed} elections`);
      return result;
    } catch (error) {
      console.error('❌ Face data cleanup failed:', error);
      throw error;
    }
  }
}

module.exports = FaceDataCleanupJob;
