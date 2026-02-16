const db = require('../config/databaseSimple');

// ============================================
// CAST VOTE
// ============================================
exports.castVote = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { candidate_id } = req.body;
    const user_id = req.user.userId;

    // Start transaction
    await connection.beginTransaction();

    // Step 1: Validate input
    if (!candidate_id) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide candidate_id'
      });
    }

    // Step 2: Check election status (must be active)
    const [electionStatus] = await connection.query(
      'SELECT status FROM election WHERE id = 1'
    );

    if (electionStatus.length === 0 || electionStatus[0].status !== 'active') {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'Voting is not active. Election is currently closed.'
      });
    }

    // Step 3: Check if user has already voted (has_voted = 0)
    const [user] = await connection.query(
      'SELECT has_voted FROM users WHERE id = ?',
      [user_id]
    );

    if (user.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user[0].has_voted === 1) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'You have already voted. Duplicate voting is not allowed.'
      });
    }

    // Step 4: Check if candidate exists
    const [candidate] = await connection.query(
      'SELECT id, name, party FROM candidates WHERE id = ?',
      [candidate_id]
    );

    if (candidate.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Step 5: Insert vote into votes table
    await connection.query(
      'INSERT INTO votes (user_id, candidate_id) VALUES (?, ?)',
      [user_id, candidate_id]
    );

    // Step 6: Increase candidate votes by 1
    await connection.query(
      'UPDATE candidates SET votes = votes + 1 WHERE id = ?',
      [candidate_id]
    );

    // Step 7: Update user has_voted = 1
    await connection.query(
      'UPDATE users SET has_voted = 1 WHERE id = ?',
      [user_id]
    );

    // Commit transaction
    await connection.commit();

    console.log('\n' + '='.repeat(50));
    console.log('VOTE CAST SUCCESSFULLY');
    console.log('='.repeat(50));
    console.log(`User ID: ${user_id}`);
    console.log(`User Email: ${req.user.email}`);
    console.log(`Candidate: ${candidate[0].name} (${candidate[0].party})`);
    console.log(`Candidate ID: ${candidate_id}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('='.repeat(50) + '\n');

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Vote cast successfully',
      data: {
        candidate: {
          id: candidate[0].id,
          name: candidate[0].name,
          party: candidate[0].party
        },
        voted_at: new Date().toISOString()
      }
    });

  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    
    console.error('Cast Vote Error:', error);
    
    // Check for duplicate vote error (unique constraint)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(403).json({
        success: false,
        message: 'You have already voted. Duplicate voting is not allowed.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to cast vote',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// ============================================
// GET VOTING STATUS
// ============================================
exports.getVotingStatus = async (req, res) => {
  try {
    const user_id = req.user.userId;

    // Get user voting status
    const [user] = await db.query(
      'SELECT has_voted FROM users WHERE id = ?',
      [user_id]
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get election status
    const [election] = await db.query(
      'SELECT status FROM election WHERE id = 1'
    );

    const electionStatus = election.length > 0 ? election[0].status : 'inactive';

    // If user has voted, get their vote details
    let voteDetails = null;
    if (user[0].has_voted === 1) {
      const [vote] = await db.query(
        `SELECT v.id, v.voted_at, c.name, c.party 
         FROM votes v 
         JOIN candidates c ON v.candidate_id = c.id 
         WHERE v.user_id = ?`,
        [user_id]
      );

      if (vote.length > 0) {
        voteDetails = {
          candidate_name: vote[0].name,
          candidate_party: vote[0].party,
          voted_at: vote[0].voted_at
        };
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Voting status retrieved successfully',
      data: {
        has_voted: user[0].has_voted === 1,
        election_status: electionStatus,
        can_vote: user[0].has_voted === 0 && electionStatus === 'active',
        vote_details: voteDetails
      }
    });

  } catch (error) {
    console.error('Get Voting Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve voting status',
      error: error.message
    });
  }
};
