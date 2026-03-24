import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { institutionalAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser } from 'react-icons/fi';

const ROLE_SUGGESTIONS = ['President', 'Vice President', 'Secretary', 'Treasurer', 'Joint Secretary', 'Cultural Secretary', 'Sports Secretary', 'Technical Head', 'Director', 'Board Member'];

const EMPTY_FORM = { name: '', inst_role: '', organization: '', description: '' };

// Candidate preview card shown before submission
const PreviewCard = ({ data, onConfirm, onEdit }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Preview Candidate</h3>
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 mb-5">
        <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <FiUser size={24} className="text-indigo-600" />
        </div>
        <p className="text-center font-bold text-gray-800 text-lg">{data.name}</p>
        <p className="text-center text-indigo-600 font-medium text-sm mt-1">{data.inst_role}</p>
        <p className="text-center text-gray-500 text-xs mt-1">{data.organization}</p>
        {data.description && (
          <p className="text-center text-gray-500 text-xs mt-3 italic">"{data.description}"</p>
        )}
      </div>
      <div className="flex gap-3">
        <button onClick={onConfirm}
          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          Confirm & Add
        </button>
        <button onClick={onEdit}
          className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
          Edit
        </button>
      </div>
    </div>
  </div>
);

const InstitutionalCandidates = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => { fetchCandidates(); }, [filterRole, search]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterRole) params.role = filterRole;
      if (search) params.search = search;
      const res = await institutionalAPI.getCandidates(electionId, params);
      setCandidates(res.data.candidates || []);
      setRoles(res.data.roles || []);
      // Grab election info from first candidate or a separate call isn't needed
      if (res.data.candidates?.length > 0) {
        setElection({ title: res.data.candidates[0].election_title, type: res.data.candidates[0].election_type });
      }
    } catch {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.inst_role || !formData.organization) {
      toast.error('Name, Position and Organization are required');
      return;
    }
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    setShowPreview(false);
    try {
      setSubmitting(true);
      if (editingId) {
        await institutionalAPI.updateCandidate(editingId, formData);
        toast.success('Candidate updated');
      } else {
        await institutionalAPI.createCandidate({ ...formData, election_id: electionId });
        toast.success('Candidate added');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);
      fetchCandidates();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (c) => {
    setFormData({ name: c.name, inst_role: c.inst_role || '', organization: c.organization || '', description: c.description || '' });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this candidate?')) return;
    try {
      await institutionalAPI.deleteCandidate(id);
      toast.success('Deleted');
      fetchCandidates();
    } catch {
      toast.error('Delete failed');
    }
  };

  // Group candidates by role
  const grouped = candidates.reduce((acc, c) => {
    const key = c.inst_role || 'Unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/admin/institutional')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition">
            <FiArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Manage Candidates</h1>
            {election && <p className="text-sm text-gray-500">{election.title}</p>}
          </div>
          <button onClick={() => { setShowForm(true); setEditingId(null); setFormData(EMPTY_FORM); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
            <FiPlus /> Add Candidate
          </button>
        </div>

        {/* Search + Role Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3">
          <div className="flex items-center border border-gray-200 rounded-lg px-3 flex-1 min-w-48">
            <FiSearch className="text-gray-400 mr-2" size={15} />
            <input type="text" placeholder="Search candidates..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 py-1.5 text-sm outline-none" />
          </div>
          {roles.length > 0 && (
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="">All Positions</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {editingId ? 'Edit Candidate' : 'Add Candidate'}
              </h2>
              <form onSubmit={handlePreview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Candidate Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Rahul Sharma"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position / Role <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={formData.inst_role}
                    onChange={e => setFormData({ ...formData, inst_role: e.target.value })}
                    placeholder="e.g., President, Secretary, Treasurer"
                    list="role-suggestions"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required />
                  <datalist id="role-suggestions">
                    {ROLE_SUGGESTIONS.map(r => <option key={r} value={r} />)}
                  </datalist>
                  <p className="text-xs text-gray-400 mt-1">Start typing or pick from suggestions</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department / Organization <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={formData.organization}
                    onChange={e => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g., CSE Department, Finance Team"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description / Manifesto
                  </label>
                  <textarea value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3} placeholder="Optional: candidate's goals or manifesto..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={submitting}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50">
                    {editingId ? 'Update' : 'Preview & Add'}
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

        {/* Preview Modal */}
        {showPreview && (
          <PreviewCard
            data={formData}
            onConfirm={handleSubmit}
            onEdit={() => setShowPreview(false)}
          />
        )}

        {/* Candidates grouped by role */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <FiUser size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 mb-3">No candidates yet</p>
            <button onClick={() => setShowForm(true)}
              className="text-indigo-600 text-sm font-medium hover:underline">Add first candidate</button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([role, list]) => (
              <div key={role}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full inline-block" />
                  {role} <span className="text-gray-300 font-normal">({list.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {list.map(c => (
                    <div key={c.id} className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-4 hover:shadow-md transition">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiUser size={18} className="text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                        <p className="text-xs text-indigo-600 font-medium">{c.inst_role}</p>
                        <p className="text-xs text-gray-400">{c.organization}</p>
                        {c.description && <p className="text-xs text-gray-400 mt-1 italic line-clamp-2">"{c.description}"</p>}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => handleEdit(c)}
                          className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionalCandidates;
