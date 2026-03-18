const { pool } = require('../config/database');

class Location {
  // Get all countries
  static async getAllCountries() {
    const connection = await pool.getConnection();
    const [countries] = await connection.query(
      'SELECT id, name, code FROM countries ORDER BY name ASC'
    );
    connection.release();
    return countries;
  }

  // Get country by ID
  static async getCountryById(id) {
    const connection = await pool.getConnection();
    const [countries] = await connection.query(
      'SELECT id, name, code FROM countries WHERE id = ?',
      [id]
    );
    connection.release();
    return countries.length > 0 ? countries[0] : null;
  }

  // Get states by country ID
  static async getStatesByCountry(countryId) {
    const connection = await pool.getConnection();
    const [states] = await connection.query(
      'SELECT id, name, code FROM states WHERE country_id = ? ORDER BY name ASC',
      [countryId]
    );
    connection.release();
    return states;
  }

  // Get state by ID
  static async getStateById(id) {
    const connection = await pool.getConnection();
    const [states] = await connection.query(
      'SELECT s.id, s.name, s.code, s.country_id, c.name as country_name FROM states s JOIN countries c ON s.country_id = c.id WHERE s.id = ?',
      [id]
    );
    connection.release();
    return states.length > 0 ? states[0] : null;
  }

  // Create country
  static async createCountry(name, code) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'INSERT INTO countries (name, code) VALUES (?, ?)',
        [name, code]
      );
      connection.release();
      return { id: result.insertId, name, code };
    } catch (error) {
      connection.release();
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Country already exists');
      }
      throw error;
    }
  }

  // Create state
  static async createState(countryId, name, code) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'INSERT INTO states (country_id, name, code) VALUES (?, ?, ?)',
        [countryId, name, code]
      );
      connection.release();
      return { id: result.insertId, country_id: countryId, name, code };
    } catch (error) {
      connection.release();
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('State already exists for this country');
      }
      throw error;
    }
  }

  // Check if voter can vote in election based on location
  static async canVoteInElection(voterId, electionId) {
    const connection = await pool.getConnection();
    
    // Get voter location
    const [voters] = await connection.query(
      'SELECT country_id, state_id FROM users WHERE id = ?',
      [voterId]
    );

    if (voters.length === 0) {
      connection.release();
      return { canVote: false, reason: 'Voter not found' };
    }

    const voter = voters[0];

    // Get election location restrictions
    const [elections] = await connection.query(
      'SELECT country_id, state_id FROM elections WHERE id = ?',
      [electionId]
    );

    if (elections.length === 0) {
      connection.release();
      return { canVote: false, reason: 'Election not found' };
    }

    const election = elections[0];
    connection.release();

    // If election has no location restrictions, anyone can vote
    if (!election.country_id && !election.state_id) {
      return { canVote: true };
    }

    // If voter has no location set
    if (!voter.country_id) {
      return { canVote: false, reason: 'Voter location not set' };
    }

    // Check country match
    if (election.country_id && voter.country_id !== election.country_id) {
      return { canVote: false, reason: 'Election restricted to different country' };
    }

    // Check state match (if election has state restriction)
    if (election.state_id && voter.state_id !== election.state_id) {
      return { canVote: false, reason: 'Election restricted to different state' };
    }

    return { canVote: true };
  }
}

module.exports = Location;
