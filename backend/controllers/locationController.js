const Location = require('../models/Location');

class LocationController {
  // Get all countries
  static async getAllCountries(req, res, next) {
    try {
      const countries = await Location.getAllCountries();
      res.json({ countries });
    } catch (error) {
      next(error);
    }
  }

  // Get states by country
  static async getStatesByCountry(req, res, next) {
    try {
      const { countryId } = req.params;
      
      if (!countryId) {
        return res.status(400).json({ error: 'Country ID is required' });
      }

      const states = await Location.getStatesByCountry(countryId);
      res.json({ states });
    } catch (error) {
      next(error);
    }
  }

  // Create country (admin only)
  static async createCountry(req, res, next) {
    try {
      const { name, code } = req.body;

      if (!name || !code) {
        return res.status(400).json({ error: 'Name and code are required' });
      }

      const country = await Location.createCountry(name, code);
      res.status(201).json({
        message: 'Country created successfully',
        country
      });
    } catch (error) {
      if (error.message === 'Country already exists') {
        return res.status(409).json({ error: error.message });
      }
      next(error);
    }
  }

  // Create state (admin only)
  static async createState(req, res, next) {
    try {
      const { country_id, name, code } = req.body;

      if (!country_id || !name) {
        return res.status(400).json({ error: 'Country ID and name are required' });
      }

      const state = await Location.createState(country_id, name, code);
      res.status(201).json({
        message: 'State created successfully',
        state
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({ error: error.message });
      }
      next(error);
    }
  }

  // Check if voter can vote in election
  static async checkVotingEligibility(req, res, next) {
    try {
      const { electionId } = req.params;
      const voterId = req.user.userId;

      const result = await Location.canVoteInElection(voterId, electionId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LocationController;
