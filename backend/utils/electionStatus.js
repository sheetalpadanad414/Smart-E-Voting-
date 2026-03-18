/**
 * Calculate election status based on current date and election dates
 * @param {Date|string} startDate - Election start date
 * @param {Date|string} endDate - Election end date
 * @returns {string} - 'upcoming', 'active', or 'completed'
 */
function calculateElectionStatus(startDate, endDate) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Normalize dates to remove time component for accurate comparison
  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999); // End date includes the full day
  
  if (now < start) {
    return 'upcoming';
  } else if (now >= start && now <= end) {
    return 'active';
  } else {
    return 'completed';
  }
}

/**
 * Add calculated status to election object
 * @param {Object} election - Election object from database
 * @returns {Object} - Election object with calculated status
 */
function addCalculatedStatus(election) {
  if (!election) return election;
  
  const calculatedStatus = calculateElectionStatus(election.start_date, election.end_date);
  
  return {
    ...election,
    status: calculatedStatus,
    db_status: election.status // Keep original DB status for reference
  };
}

/**
 * Add calculated status to array of elections
 * @param {Array} elections - Array of election objects
 * @returns {Array} - Array of elections with calculated status
 */
function addCalculatedStatusToArray(elections) {
  if (!Array.isArray(elections)) return elections;
  
  return elections.map(election => addCalculatedStatus(election));
}

module.exports = {
  calculateElectionStatus,
  addCalculatedStatus,
  addCalculatedStatusToArray
};
