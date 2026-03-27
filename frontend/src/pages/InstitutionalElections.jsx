import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { institutionalAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiCalendar, FiFilter } from 'react-icons/fi';

const TYPE_LABELS = {
  college: 'College Election',
  university: 'University Election',
  society: 'Society Election',
  company: 'Company Board Election'
};

const TYPE_COLORS = {
  college: 'bg-blue-100 text-blue-700',
  university: 'bg-purple-100 text-purple-700',
  society: 'bg-green-100 text-green-700',
  company: 'bg-orange-100 text-orange-700'
};

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-red-100 text-red-600'
};

const EMPTY_FORM = {
  title: '', type: '', description: '', start_date: '', end_date: ''
};

const InstitutionalElections = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchElections(); }, [filterType, filterStatus]);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      const res = await institutionalAPI.getElections(params);
      setElections(res.data.elections || []);
    } catch {
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.type || !formData.start_date || !formData.end_date) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      setSubmitting(true);
      if (editingId) {
        await institutionalAPI.updateElection(editingId, formData);
        toast.success('Election updated');
      } else {
        await institutionalAPI.createElection(formData);
        toast.success('Election created');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);
      fetchElections();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (el) => {
    setFormData({
      title: el.title,
      type: el.election_type,
      description: el.description || '',
      start_date: el.start_date?.slice(0, 16) || '',
      end_date: el.end_date?.slice(0, 16) || ''
    });
    setEditingId(el.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this election?')) return;
    try {
      await institutionalAPI.deleteElection(id);
      toast.success('Deleted');
      fetchElections();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Institutional Elections</h1>
            <p className="text-sm text-gray-500 mt-1">Manage college, university, society and company board elections</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setFormData(EMPTY_FORM); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
          >
            <FiPlus /> New Election
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          <FiFilter className="text-gray-400" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All Types</option>
            {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          {(filterType || filterStatus) && (
            <button onClick={() => { setFilterType(''); setFilterStatus(''); }} className="text-sm text-red-500 hover:underline">Clear</button>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {editingId ? 'Edit Election' : 'Create Institutional Election'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Student Council Election 2025"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Election Type <span className="text-red-500">*</span></label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                  >
                    <option value="">Select type</option>
                    {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                    <input type="datetime-local" value={formData.start_date}
                      onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
                    <input type="datetime-local" value={formData.end_date}
                      onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3} placeholder="Optional description..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={submitting}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50">
                    {submitting ? 'Saving...' : editingId ? 'Update' : 'Create Election'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Elections Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : elections.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <p className="text-gray-400 mb-3">No institutional elections found</p>
            <button onClick={() => setShowForm(true)}
              className="text-indigo-600 text-sm font-medium hover:underline">Create your first one</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {elections.map(el => (
              <div key={el.id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${TYPE_COLORS[el.election_type] || 'bg-gray-100 text-gray-600'}`}>
                    {TYPE_LABELS[el.election_type] || el.election_type}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[el.status]}`}>
                    {el.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{el.title}</h3>
                {el.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{el.description}</p>}
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                  <FiCalendar size={12} />
                  <span>{new Date(el.start_date).toLocaleDateString()} – {new Date(el.end_date).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/admin/institutional/candidates/${el.id}`)}
                    className="flex-1 flex items-center justify-center gap-1 bg-indigo-50 text-indigo-600 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-100 transition">
                    <FiUsers size={13} /> Candidates
                  </button>
                  <button onClick={() => handleEdit(el)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                    <FiEdit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(el.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionalElections;
