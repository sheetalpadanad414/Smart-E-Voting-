import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminAPI, partyAPI, institutionalAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiArrowLeft, FiSearch } from 'react-icons/fi';

const INSTITUTIONAL_TYPES = ['college', 'university', 'society', 'company'];

// Checks both scope (reliable) and election_type (fallback) to detect institutional elections
const checkIsInstitutional = (electionObj) => {
  if (!electionObj) return false;
  if (electionObj.scope === 'institutional') return true;
  const type = (electionObj.election_type || '').toLowerCase();
  return INSTITUTIONAL_TYPES.some(t => type.includes(t));
};

const ROLE_SUGGESTIONS = [
  'President', 'Vice President', 'Secretary', 'Joint Secretary',
  'Treasurer', 'Cultural Secretary', 'Sports Secretary', 'Technical Head',
  'Director', 'Board Member'
];

const EMPTY_FORM = {
  election_id: '',
  name: '',
  description: '',
  // political fields
  position: '',
  party_id: '',
  // institutional fields
  inst_role: '',
  organization: ''
};

const AdminCandidates = () => {
  const { electionId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedElection, setSelectedElection] = useState(electionId || '');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ ...EMPTY_FORM, election_id: electionId || '' });

  // Derive election type from selected election object
  const selectedElectionObj = elections.find(e => e.id === selectedElection);
  const electionType = selectedElectionObj?.election_type?.toLowerCase() || '';
  const isInstitutional = checkIsInstitutional(selectedElectionObj);

  useEffect(() => {
    fetchElections();
    fetchParties();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      setPage(1);
      fetchCandidates();
    }
  }, [selectedElection]);

  // When election changes in form, reset type-specific fields
  const handleElectionChange = (id) => {
    const el = elections.find(e => e.id === id);
    const inst = checkIsInstitutional(el);
    setSelectedElection(id);
    setFormData(prev => ({
      ...prev,
      election_id: id,
      party_id: inst ? '' : prev.party_id,
      position: inst ? '' : prev.position,
      inst_role: inst ? prev.inst_role : '',
      organization: inst ? prev.organization : ''
    }));
  };

  const fetchElections = async () => {
    try {
      const response = await adminAPI.getAllElections(1, 100);
      const all = response.data.elections || [];
      const seen = new Set();
      const unique = all.filter(e => {
        const key = e.title.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setElections(unique);
    } catch {
      toast.error('Failed to load elections');
    }
  };

  const fetchParties = async () => {
    try {
      const res = await partyAPI.getPartiesSimple();
      setParties(res.data?.parties || []);
    } catch {
      setParties([]);
    }
  };

  const fetchCandidates = async () => {
    if (!selectedElection) return;
    try {
      setLoading(true);
      const response = await adminAPI.getCandidates(selectedElection, page, 20);
      setCandidates(response.data.candidates || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      if (!error.response?.data?.message?.includes('collation')) {
        toast.error('Failed to load candidates');
      }
      setCandidates([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm('Delete this candidate?')) return;
    try {
      await adminAPI.deleteCandidate(id);
      toast.success('Candidate deleted');
      fetchCandidates();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  };

  const handleEditCandidate = (candidate) => {
    setFormData({
      election_id: candidate.election_id,
      name: candidate.name,
      description: candidate.description || '',
      position: candidate.position || '',
      party_id: candidate.party_id || '',
      inst_role: candidate.inst_role || '',
      organization: candidate.organization || ''
    });
    setEditingId(candidate.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.election_id || !formData.name) {
      toast.error('Election and candidate name are required');
      return;
    }

    // Derive type at submit time
    const el = elections.find(ev => ev.id === formData.election_id);
    const inst = checkIsInstitutional(el);

    if (inst) {
      if (!formData.inst_role || !formData.organization) {
        toast.error('Position and Organization are required for institutional elections');
        return;
      }
    }

    // Build clean payload — never send both sets of fields
    const payload = inst
      ? {
          election_id: formData.election_id,
          name: formData.name,
          description: formData.description,
          inst_role: formData.inst_role,
          organization: formData.organization,
          party_id: null,
          party_name: null
        }
      : {
          election_id: formData.election_id,
          name: formData.name,
          description: formData.description,
          position: formData.position,
          party_id: formData.party_id || null
        };

    try {
      setLoading(true);
      if (editingId) {
        await adminAPI.updateCandidate(editingId, payload);
        toast.success('Candidate updated');
        setEditingId(null);
      } else {
        await adminAPI.createCandidate(payload);
        toast.success('Candidate added');
      }
      resetForm();
      setShowForm(false);
      fetchCandidates();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM, election_id: selectedElection || '' });
  };

  const handleNewCandidate = () => {
    setEditingId(null);
    resetForm();
    setShowForm(true);
  };

  // Determine form-level institutional flag (based on form's selected election)
  const formElectionObj = elections.find(e => e.id === formData.election_id);
  const formIsInstitutional = checkIsInstitutional(formElectionObj);

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Form view ──────────────────────────────────────────────
  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <button onClick={() => setShowForm(false)}
            className="text-blue-500 hover:text-blue-600 flex items-center gap-2 mb-6">
            <FiArrowLeft /> Back to Candidates
          </button>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {editingId ? 'Edit Candidate' : 'Add New Candidate'}
          </h1>

          {/* Election type badge */}
          {formData.election_id && (
            <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full mb-6 ${
              formIsInstitutional
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {formIsInstitutional ? 'Institutional Election' : 'Political Election'}
            </span>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Election selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Election *</label>
              <select
                value={formData.election_id}
                onChange={e => handleElectionChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!!editingId}
              >
                <option value="">Select an election</option>
                {elections.map(el => (
                  <option key={el.id} value={el.id}>
                    {el.title}{el.election_type ? ` — ${el.election_type}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Candidate name — always shown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Name *</label>
              <input type="text" value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter candidate name" required />
            </div>

            {/* ── INSTITUTIONAL FIELDS ── */}
            {formIsInstitutional && (
              <div className="space-y-4 transition-all duration-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position / Role *</label>
                  <input type="text" value={formData.inst_role}
                    onChange={e => setFormData({ ...formData, inst_role: e.target.value })}
                    list="role-suggestions"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., President, Secretary, Treasurer"
                    required />
                  <datalist id="role-suggestions">
                    {ROLE_SUGGESTIONS.map(r => <option key={r} value={r} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department / Organization *</label>
                  <input type="text" value={formData.organization}
                    onChange={e => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., CSE Department, Finance Team"
                    required />
                </div>
              </div>
            )}

            {/* ── POLITICAL FIELDS ── */}
            {!formIsInstitutional && formData.election_id && (
              <div className="space-y-4 transition-all duration-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Party</label>
                  <select value={formData.party_id}
                    onChange={e => setFormData({ ...formData, party_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select a party (optional)</option>
                    {parties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position / Constituency</label>
                  <input type="text" value={formData.position}
                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., President, Vice President" />
                </div>
              </div>
            )}

            {/* Description — always shown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formIsInstitutional ? 'Description / Manifesto' : 'Description'}
              </label>
              <textarea value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={formIsInstitutional ? "Candidate's goals or manifesto..." : "Enter candidate description or bio"}
                rows="4" />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={loading}
                className="flex-1 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-semibold disabled:opacity-50">
                {loading ? 'Saving...' : editingId ? 'Update Candidate' : 'Add Candidate'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-semibold">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Candidates</h1>
            {selectedElectionObj && (
              <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full mt-1 ${
                isInstitutional ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {isInstitutional ? 'Institutional Election' : 'Political Election'}
              </span>
            )}
          </div>
          <button onClick={handleNewCandidate} disabled={!selectedElection}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
            <FiPlus /> Add Candidate
          </button>
        </div>

        {/* Election selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Election</label>
          <select value={selectedElection}
            onChange={e => handleElectionChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">-- Choose an election --</option>
            {elections.map(el => (
              <option key={el.id} value={el.id}>
                {el.title}{el.election_type ? ` — ${el.election_type}` : ''} ({el.status})
              </option>
            ))}
          </select>
        </div>

        {selectedElection && (
          <>
            {/* Search */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg px-4">
                <FiSearch className="text-gray-400" />
                <input type="text" placeholder="Search candidates by name..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="flex-1 ml-2 py-2 outline-none" />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-600">Loading candidates...</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">No candidates found for this election</p>
                <button onClick={handleNewCandidate}
                  className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
                  Add First Candidate
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      {isInstitutional ? (
                        <>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Position</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Organization</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Party</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Position</th>
                        </>
                      )}
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Votes</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map(candidate => (
                      <tr key={candidate.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-800">{candidate.name}</td>
                        {isInstitutional ? (
                          <>
                            <td className="px-6 py-4 text-sm text-gray-600">{candidate.inst_role || candidate.position || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{candidate.organization || '-'}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                {candidate.party_logo && (
                                  <img src={candidate.party_logo} alt={candidate.party_name}
                                    className="w-6 h-6 object-contain"
                                    onError={e => e.target.style.display = 'none'} />
                                )}
                                <span>{candidate.party_name || '-'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{candidate.position || '-'}</td>
                          </>
                        )}
                        <td className="px-6 py-4 text-sm font-semibold text-blue-600">{candidate.vote_count || 0}</td>
                        <td className="px-6 py-4 text-right text-sm space-x-2">
                          <button onClick={() => handleEditCandidate(candidate)}
                            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 font-semibold">
                            <FiEdit2 size={16} /> Edit
                          </button>
                          <button onClick={() => handleDeleteCandidate(candidate.id)}
                            className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 font-semibold ml-2">
                            <FiTrash2 size={16} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {total > 20 && (
                  <div className="flex items-center justify-between py-4 px-6 border-t">
                    <span className="text-sm text-gray-600">
                      Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                        className="px-4 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">
                        Previous
                      </button>
                      <button onClick={() => setPage(page + 1)} disabled={page * 20 >= total}
                        className="px-4 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCandidates;
