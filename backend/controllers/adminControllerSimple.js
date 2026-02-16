const db = require('../config/databaseSimple');

// ============================================
// GET DASHBOARD STATS
// ============================================
exports.getDashboard = async (req, res) => {
  try {
    // Get user statistics
    const [userStats] = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins,
        SUM(CASE WHEN role = 'voter' AND is_verified = 1 THEN 1 ELSE 0 END) as verified_voters,
        SUM(CASE WHEN role = 'voter' AND is_verified = 0 THEN 1 ELSE 0 END) as unverified_voters
      FROM users
    `);

    // Get election status
    const [electionStatus] = await db.query('SELECT status FROM election WHERE id = 1');
    
    // Get candidate count
    const [candidateCount] = await db.query('SELECT COUNT(*) as total FROM candidates');

    // Get total votes cast
    const [voteCount] = await db.query('SELECT COUNT(*) as total FROM votes');

    return res.status(200).json({
      success: true,
      data: {
        users: userStats[0],
        elections: {
          active: electionStatus[0]?.status === 'active' ? 1 : 0,
          completed: 0,
          draft: electionStatus[0]?.status === 'inactive' ? 1 : 0
        },
        candidates: candidateCount[0].total,
        votes: voteCount[0].total,
        recent_activities: []
      }
    });

  } catch (error) {
    console.error('Get Dashboard Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard data',
      error: error.message
    });
  }
};

// ============================================
// ADD CANDIDATE
// ============================================
exports.addCandidate = async (req, res) => {
  try {
    const { name, party } = req.body;

    // Validate input
    if (!name || !party) {
      return res.status(400).json({
        success: false,
        message: 'Please provide candidate name and party'
      });
    }

    // Check if candidate already exists
    const checkQuery = 'SELECT id FROM candidates WHERE name = ? AND party = ?';
    const [existing] = await db.query(checkQuery, [name, party]);

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Candidate with this name and party already exists'
      });
    }

    // Insert candidate with votes = 0 (default)
    const insertQuery = `
      INSERT INTO candidates (name, party, votes)
      VALUES (?, ?, 0)
    `;

    const [result] = await db.query(insertQuery, [name, party]);

    console.log('\n' + '='.repeat(50));
    console.log('NEW CANDIDATE ADDED');
    console.log('='.repeat(50));
    console.log(`ID: ${result.insertId}`);
    console.log(`Name: ${name}`);
    console.log(`Party: ${party}`);
    console.log(`Votes: 0`);
    console.log(`Added by: ${req.user.email}`);
    console.log('='.repeat(50) + '\n');

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Candidate added successfully',
      data: {
        id: result.insertId,
        name: name,
        party: party,
        votes: 0
      }
    });

  } catch (error) {
    console.error('Add Candidate Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add candidate',
      error: error.message
    });
  }
};

// ============================================
// GET ALL CANDIDATES
// ============================================
exports.getAllCandidates = async (req, res) => {
  try {
    const query = 'SELECT * FROM candidates ORDER BY votes DESC';
    const [candidates] = await db.query(query);

    return res.status(200).json({
      success: true,
      message: 'Candidates retrieved successfully',
      data: {
        count: candidates.length,
        candidates: candidates
      }
    });

  } catch (error) {
    console.error('Get Candidates Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve candidates',
      error: error.message
    });
  }
};

// ============================================
// DELETE CANDIDATE
// ============================================
exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if candidate exists
    const checkQuery = 'SELECT * FROM candidates WHERE id = ?';
    const [candidates] = await db.query(checkQuery, [id]);

    if (candidates.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Delete candidate
    const deleteQuery = 'DELETE FROM candidates WHERE id = ?';
    await db.query(deleteQuery, [id]);

    console.log('\n' + '='.repeat(50));
    console.log('CANDIDATE DELETED');
    console.log('='.repeat(50));
    console.log(`ID: ${id}`);
    console.log(`Name: ${candidates[0].name}`);
    console.log(`Party: ${candidates[0].party}`);
    console.log(`Deleted by: ${req.user.email}`);
    console.log('='.repeat(50) + '\n');

    return res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully'
    });

  } catch (error) {
    console.error('Delete Candidate Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete candidate',
      error: error.message
    });
  }
};

// ============================================
// START ELECTION
// ============================================
exports.startElection = async (req, res) => {
  try {
    // Update election status to 'active'
    const query = 'UPDATE election SET status = ? WHERE id = 1';
    await db.query(query, ['active']);

    console.log('\n' + '='.repeat(50));
    console.log('ELECTION STARTED');
    console.log('='.repeat(50));
    console.log(`Status: active`);
    console.log(`Started by: ${req.user.email}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('='.repeat(50) + '\n');

    return res.status(200).json({
      success: true,
      message: 'Election started successfully. Voting is now active.',
      data: {
        status: 'active',
        started_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Start Election Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start election',
      error: error.message
    });
  }
};

// ============================================
// STOP ELECTION
// ============================================
exports.stopElection = async (req, res) => {
  try {
    // Update election status to 'inactive'
    const query = 'UPDATE election SET status = ? WHERE id = 1';
    await db.query(query, ['inactive']);

    console.log('\n' + '='.repeat(50));
    console.log('ELECTION STOPPED');
    console.log('='.repeat(50));
    console.log(`Status: inactive`);
    console.log(`Stopped by: ${req.user.email}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('='.repeat(50) + '\n');

    return res.status(200).json({
      success: true,
      message: 'Election stopped successfully. Voting is now closed.',
      data: {
        status: 'inactive',
        stopped_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Stop Election Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to stop election',
      error: error.message
    });
  }
};

// ============================================
// GET ELECTION STATUS
// ============================================
exports.getElectionStatus = async (req, res) => {
  try {
    const query = 'SELECT * FROM election WHERE id = 1';
    const [election] = await db.query(query);

    if (election.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Election status retrieved successfully',
      data: {
        id: election[0].id,
        status: election[0].status,
        is_active: election[0].status === 'active'
      }
    });

  } catch (error) {
    console.error('Get Election Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve election status',
      error: error.message
    });
  }
};

// ============================================
// GET ELECTION RESULTS
// ============================================
exports.getElectionResults = async (req, res) => {
  try {
    // Fetch all candidates sorted by votes descending
    const query = 'SELECT id, name, party, votes FROM candidates ORDER BY votes DESC';
    const [candidates] = await db.query(query);

    // Calculate total votes
    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);

    // Add percentage to each candidate
    const results = candidates.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      party: candidate.party,
      votes: candidate.votes,
      percentage: totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(2) : '0.00'
    }));

    console.log('\n' + '='.repeat(50));
    console.log('ELECTION RESULTS RETRIEVED');
    console.log('='.repeat(50));
    console.log(`Total Candidates: ${candidates.length}`);
    console.log(`Total Votes: ${totalVotes}`);
    if (results.length > 0) {
      console.log(`Winner: ${results[0].name} (${results[0].party}) - ${results[0].votes} votes`);
    }
    console.log('='.repeat(50) + '\n');

    return res.status(200).json({
      success: true,
      message: 'Election results retrieved successfully',
      data: {
        total_votes: totalVotes,
        total_candidates: candidates.length,
        results: results,
        winner: results.length > 0 ? results[0] : null
      }
    });

  } catch (error) {
    console.error('Get Election Results Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve election results',
      error: error.message
    });
  }
};
