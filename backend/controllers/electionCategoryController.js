const ElectionCategory = require('../models/ElectionCategory');
const Election = require('../models/Election');
const { pool } = require('../config/database');
const { generateUUID } = require('../utils/auth');

class ElectionCategoryController {
  /**
   * Get all election categories
   */
  static async getAllCategories(req, res, next) {
    try {
      const categories = await ElectionCategory.getAll();
      res.json({ categories });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category by ID with types
   */
  static async getCategory(req, res, next) {
    try {
      const { id } = req.params;
      const category = await ElectionCategory.findById(id);
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json({ category });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get elections by category
   */
  static async getElectionsByCategory(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const filters = {
        status: req.query.status,
        type_id: req.query.type_id,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const result = await ElectionCategory.getElectionsByCategory(id, page, limit, filters);
      
      res.json({
        elections: result.elections,
        total: result.total,
        pages: result.pages,
        current_page: page
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category statistics
   */
  static async getCategoryStatistics(req, res, next) {
    try {
      const { id } = req.params;
      const stats = await ElectionCategory.getStatistics(id);
      res.json({ statistics: stats });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create election in category
   */
  static async createElectionInCategory(req, res, next) {
    try {
      const { id: categoryId } = req.params;
      const electionData = {
        ...req.body,
        category_id: parseInt(categoryId)
      };

      // Validate category exists
      const category = await ElectionCategory.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Create election
      const election = await Election.create(electionData, req.user.userId);

      res.status(201).json({
        message: 'Election created successfully',
        election
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get election types by category
   */
  static async getTypesByCategory(req, res, next) {
    try {
      const { id } = req.params;
      
      const connection = await pool.getConnection();
      const [types] = await connection.query(
        'SELECT * FROM election_types WHERE category_id = ? ORDER BY type_name ASC',
        [id]
      );
      connection.release();
      
      res.json({ types });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ElectionCategoryController;
