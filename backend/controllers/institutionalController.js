const { pool } = require('../config/database');
const { generateUUID } = require('../utils/auth');
const AdminService = require('../services/adminService');

const INSTITUTIONAL_TYPES = ['college', 'university', 'society', 'company'];

class InstitutionalController {

  // ── Elections ──────────────────────────────────────────────

  static async getAllElections(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const { status, type } = req.query;
      const offset = (page - 1) * limit;

      let where = "scope = 'institutional'";
      const params = [];

      if (status) { where += ' AND status = ?'; params.push(status); }
      if (type)   { where += ' AND election_type = ?'; params.push(type); }

      const [rows] = await pool.query(
        `SELECT id, title, description, election_type, status, start_date, end_date, created_at
         FROM elections WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) as total FROM elections WHERE ${where}`, params
      );

      res.json({ elections: rows, total, pages: Math.ceil(total / limit), current_page: page });
    } catch (err) { next(err); }
  }

  static async createElection(req, res, next) {
    try {
      const { title, description, type, start_date, end_date } = req.body;

      if (!title || !type || !start_date || !end_date) {
        return res.status(400).json({ error: 'title, type, start_date and end_date are required' });
      }
      if (!INSTITUTIONAL_TYPES.includes(type)) {
        return res.status(400).json({ error: `type must be one of: ${INSTITUTIONAL_TYPES.join(', ')}` });
      }

      // Duplicate check
      const [[existing]] = await pool.query(
        "SELECT id FROM elections WHERE LOWER(title) = LOWER(?) AND scope = 'institutional'",
        [title.trim()]
      );
      if (existing) return res.status(409).json({ error: `Election "${title}" already exists` });

      const id = generateUUID();
      await pool.query(
        `INSERT INTO elections (id, title, description, election_type, scope, start_date, end_date, status, created_by)
         VALUES (?, ?, ?, ?, 'institutional', ?, ?, 'draft', ?)`,
        [id, title.trim(), description || null, type, start_date, end_date, req.user.userId]
      );

      AdminService.logAction(req.user.userId, 'CREATE_INST_ELECTION', 'election', id, req.body, req.ip);
      res.status(201).json({ message: 'Election created', election: { id, title, type, status: 'draft' } });
    } catch (err) { next(err); }
  }

  static async updateElection(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, type, start_date, end_date, status } = req.body;

      const [[el]] = await pool.query("SELECT id FROM elections WHERE id = ? AND scope = 'institutional'", [id]);
      if (!el) return res.status(404).json({ error: 'Institutional election not found' });

      if (type && !INSTITUTIONAL_TYPES.includes(type)) {
        return res.status(400).json({ error: `type must be one of: ${INSTITUTIONAL_TYPES.join(', ')}` });
      }

      await pool.query(
        `UPDATE elections SET
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          election_type = COALESCE(?, election_type),
          start_date = COALESCE(?, start_date),
          end_date = COALESCE(?, end_date),
          status = COALESCE(?, status)
         WHERE id = ?`,
        [title || null, description || null, type || null, start_date || null, end_date || null, status || null, id]
      );

      res.json({ message: 'Election updated' });
    } catch (err) { next(err); }
  }

  static async deleteElection(req, res, next) {
    try {
      const { id } = req.params;
      const [[el]] = await pool.query("SELECT status FROM elections WHERE id = ? AND scope = 'institutional'", [id]);
      if (!el) return res.status(404).json({ error: 'Not found' });
      if (el.status !== 'draft') return res.status(400).json({ error: 'Only draft elections can be deleted' });

      await pool.query('DELETE FROM elections WHERE id = ?', [id]);
      res.json({ message: 'Election deleted' });
    } catch (err) { next(err); }
  }

  // ── Candidates ─────────────────────────────────────────────

  static async getCandidates(req, res, next) {
    try {
      const { election_id } = req.params;
      const { role, search } = req.query;

      let where = 'c.election_id = ?';
      const params = [election_id];

      if (role)   { where += ' AND c.inst_role = ?'; params.push(role); }
      if (search) { where += ' AND c.name LIKE ?'; params.push(`%${search}%`); }

      const [candidates] = await pool.query(
        `SELECT c.id, c.name, c.inst_role, c.organization, c.description, c.vote_count, c.created_at,
                e.title as election_title, e.election_type
         FROM candidates c
         JOIN elections e ON e.id = c.election_id
         WHERE ${where}
         ORDER BY c.inst_role, c.name`,
        params
      );

      // Distinct roles for filter
      const [roles] = await pool.query(
        'SELECT DISTINCT inst_role FROM candidates WHERE election_id = ? AND inst_role IS NOT NULL ORDER BY inst_role',
        [election_id]
      );

      res.json({ candidates, total: candidates.length, roles: roles.map(r => r.inst_role) });
    } catch (err) { next(err); }
  }

  static async createCandidate(req, res, next) {
    try {
      const { election_id, name, inst_role, organization, description } = req.body;

      // Reject any party data
      if (req.body.party_id || req.body.party_name || req.body.symbol) {
        return res.status(400).json({ error: 'Party/symbol data is not allowed for institutional candidates' });
      }

      if (!election_id || !name || !inst_role || !organization) {
        return res.status(400).json({ error: 'election_id, name, role and organization are required' });
      }

      // Verify election is institutional
      const [[el]] = await pool.query("SELECT id, status FROM elections WHERE id = ? AND scope = 'institutional'", [election_id]);
      if (!el) return res.status(404).json({ error: 'Institutional election not found' });
      if (el.status === 'completed') return res.status(400).json({ error: 'Cannot add candidate to completed election' });

      // Duplicate name check
      const [[dup]] = await pool.query(
        'SELECT id FROM candidates WHERE election_id = ? AND name = ?',
        [election_id, name.trim()]
      );
      if (dup) return res.status(409).json({ error: 'Candidate with this name already exists in this election' });

      const id = generateUUID();
      await pool.query(
        `INSERT INTO candidates (id, election_id, name, inst_role, organization, description, party_id, party_name)
         VALUES (?, ?, ?, ?, ?, ?, NULL, NULL)`,
        [id, election_id, name.trim(), inst_role.trim(), organization.trim(), description || null]
      );

      AdminService.logAction(req.user.userId, 'CREATE_INST_CANDIDATE', 'candidate', id, req.body, req.ip);
      res.status(201).json({ message: 'Candidate created', candidate: { id, name, inst_role, organization } });
    } catch (err) { next(err); }
  }

  static async updateCandidate(req, res, next) {
    try {
      const { id } = req.params;
      const { name, inst_role, organization, description } = req.body;

      if (req.body.party_id || req.body.party_name || req.body.symbol) {
        return res.status(400).json({ error: 'Party/symbol data is not allowed for institutional candidates' });
      }

      await pool.query(
        `UPDATE candidates SET
          name = COALESCE(?, name),
          inst_role = COALESCE(?, inst_role),
          organization = COALESCE(?, organization),
          description = COALESCE(?, description)
         WHERE id = ?`,
        [name || null, inst_role || null, organization || null, description || null, id]
      );

      res.json({ message: 'Candidate updated' });
    } catch (err) { next(err); }
  }

  static async deleteCandidate(req, res, next) {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM candidates WHERE id = ?', [id]);
      res.json({ message: 'Candidate deleted' });
    } catch (err) { next(err); }
  }
}

module.exports = InstitutionalController;
