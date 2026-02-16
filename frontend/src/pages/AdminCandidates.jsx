import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiArrowLeft, FiSearch } from 'react-icons/fi';

const AdminCandidates = () => {
  const { electionId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedElection, setSelectedElection] = useState(electionId || '');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    election_id: electionId || '',
    name: '',
    description: '',
    symbol: '',
    position: '',
    party_name: '',
    image_url: ''
  });

  // Fetch elections for dropdown
  useEffect(() => {
    fetchElections();
  }, []);

  // Fetch candidates when election is selected
  useEffect(() => {
    if (selectedElection) {
      setPage(1);
      fetchCandidates();
    }
  }, [selectedElection]);

  const fetchElections = async () => {
    try {
      const response = await adminAPI.getAllElections(1, 100, {});
      setElections(response.data.elections || []);
    } catch (error) {
      toast.error('Failed to load elections');
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
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await adminAPI.deleteCandidate(id);
        toast.success('Candidate deleted successfully');
        fetchCandidates();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete candidate');
      }
    }
  };

  const handleEditCandidate = (candidate) => {
    setFormData({
      election_id: candidate.election_id,
      name: candidate.name,
      description: candidate.description || '',
      symbol: candidate.symbol || '',
      position: candidate.position || '',
      party_name: candidate.party_name || '',
      image_url: candidate.image_url || ''
    });
    setEditingId(candidate.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.election_id || !formData.name) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await adminAPI.updateCandidate(editingId, formData);
        toast.success('Candidate updated successfully');
        setEditingId(null);
      } else {
        await adminAPI.createCandidate(formData);
        toast.success('Candidate created successfully');
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
    setFormData({
      election_id: selectedElection || '',
      name: '',
      description: '',
      symbol: '',
      position: '',
      party_name: '',
      image_url: ''
    });
  };

  const handleNewCandidate = () => {
    setEditingId(null);
    resetForm();
    setShowForm(true);
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setShowForm(false)}
              className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
            >
              <FiArrowLeft /> Back to Candidates
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {editingId ? 'Edit Candidate' : 'Add New Candidate'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Election *
              </label>
              <select
                value={formData.election_id}
                onChange={(e) => {
                  setFormData({ ...formData, election_id: e.target.value });
                  setSelectedElection(e.target.value);
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!!editingId}
              >
                <option value="">Select an election</option>
                {elections.map((election) => (
                  <option key={election.id} value={election.id}>
                    {election.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Candidate Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter candidate name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Party Name
              </label>
              <input
                type="text"
                value={formData.party_name}
                onChange={(e) => setFormData({ ...formData, party_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter party name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., President, Vice President"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Symbol/Logo
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 🦁 or party symbol"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter candidate description or bio"
                rows="4"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingId ? 'Update Candidate' : 'Add Candidate'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Candidates</h1>
          <button
            onClick={handleNewCandidate}
            disabled={!selectedElection}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus /> Add Candidate
          </button>
        </div>

        {/* Election Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Election
          </label>
          <select
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choose an election --</option>
            {elections.map((election) => (
              <option key={election.id} value={election.id}>
                {election.title} ({election.status})
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
                <input
                  type="text"
                  placeholder="Search candidates by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 ml-2 py-2 outline-none"
                />
              </div>
            </div>

            {/* Candidates Table */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-600">Loading candidates...</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">No candidates found for this election</p>
                <button
                  onClick={handleNewCandidate}
                  className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Add First Candidate
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Party
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Symbol
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Votes
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((candidate) => (
                      <tr key={candidate.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-800">{candidate.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {candidate.party_name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {candidate.position || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {candidate.symbol || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                          {candidate.vote_count || 0}
                        </td>
                        <td className="px-6 py-4 text-right text-sm space-x-2">
                          <button
                            onClick={() => handleEditCandidate(candidate)}
                            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 font-semibold"
                          >
                            <FiEdit2 size={16} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCandidate(candidate.id)}
                            className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 font-semibold ml-2"
                          >
                            <FiTrash2 size={16} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {total > 20 && (
                  <div className="flex items-center justify-between py-4 px-6 border-t">
                    <span className="text-sm text-gray-600">
                      Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page * 20 >= total}
                        className="px-4 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                      >
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
