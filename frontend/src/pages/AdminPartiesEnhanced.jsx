import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { partyAPI, adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX, FiImage, FiUsers } from 'react-icons/fi';
import { TableSkeleton } from '../components/LoadingSkeleton';

const AdminPartiesEnhanced = () => {
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: ''  // Filename only: 'aap.png'
  });
  const [showCandidates, setShowCandidates] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [partyCandidates, setPartyCandidates] = useState([]);

  // Available logo files in backend/uploads/ (PNG format for real logos)
  const logoOptions = [
    { value: '', label: 'No Logo' },
    { value: 'aap.png', label: 'Aam Aadmi Party (AAP)' },
    { value: 'bjp.png', label: 'Bharatiya Janata Party (BJP)' },
    { value: 'congress.png', label: 'Indian National Congress' },
    { value: 'democratic.png', label: 'Democratic Party' },
    { value: 'republican.png', label: 'Republican Party' },
    { value: 'green.png', label: 'Green Party' },
    { value: 'independent.png', label: 'Independent' },
    { value: 'default.png', label: 'Default Logo' }
  ];

  useEffect(() => {
    fetchParties();
  }, [page, search]);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const response = await partyAPI.getAllParties(page, 20, search);
      setParties(response.data.parties);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Failed to load parties');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (editingId) {
        await partyAPI.updateParty(editingId, formData);
        toast.success('Party updated successfully');
      } else {
        await partyAPI.createParty(formData);
        toast.success('Party created successfully');
      }

      setFormData({ name: '', description: '', logo: '' });
      setEditingId(null);
      setShowForm(false);
      fetchParties();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (party) => {
    setEditingId(party.id);
    // Extract filename from full URL if present
    let logoFilename = party.logo || '';
    if (logoFilename && logoFilename.includes('/uploads/')) {
      logoFilename = logoFilename.split('/uploads/')[1];
    }
    setFormData({
      name: party.name,
      description: party.description || '',
      logo: logoFilename
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will affect all candidates associated with this party.')) {
      try {
        await partyAPI.deleteParty(id);
        toast.success('Party deleted successfully');
        fetchParties();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete party');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', logo: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleViewCandidates = async (party) => {
    try {
      setLoading(true);
      setSelectedParty(party);
      const response = await adminAPI.getCandidatesByParty(party.id);
      setPartyCandidates(response.data.candidates || []);
      setShowCandidates(true);
    } catch (error) {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  if (showCandidates && selectedParty) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {selectedParty.logo && (
                  <img 
                    src={selectedParty.logo} 
                    alt={selectedParty.name}
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {selectedParty.name} Candidates
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {partyCandidates.length} candidate(s) found
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCandidates(false);
                  setSelectedParty(null);
                  setPartyCandidates([]);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-smooth"
              >
                <FiX size={24} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {partyCandidates.length === 0 ? (
              <div className="text-center py-12">
                <FiUsers className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
                <p className="text-gray-600 dark:text-gray-400">No candidates found for this party</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Name</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Election</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Position</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partyCandidates.map((candidate) => (
                      <tr key={candidate.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{candidate.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{candidate.election_title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{candidate.position || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            candidate.election_status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            candidate.election_status === 'completed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {candidate.election_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">{candidate.vote_count || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Party' : 'Create New Party'}
              </h1>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-smooth"
              >
                <FiX size={24} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Party Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Party Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                  required
                  placeholder="Enter party name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth min-h-24"
                  placeholder="Enter party description"
                />
              </div>

              {/* Logo Selection Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Party Logo
                </label>
                <select
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                >
                  {logoOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select a logo from available images in uploads folder
                </p>
                
                {/* Logo Preview */}
                {formData.logo && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                    <div className="w-20 h-20 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-700 overflow-hidden">
                      <img 
                        src={`http://localhost:5000/uploads/${formData.logo}`}
                        alt="Logo preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const errorMsg = document.createElement('p');
                          errorMsg.className = 'text-xs text-red-500 text-center px-2';
                          errorMsg.textContent = 'Image not found';
                          e.target.parentElement.appendChild(errorMsg);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-smooth disabled:opacity-50 shadow-md"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Party' : 'Create Party'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-smooth shadow-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 animate-slideIn">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Parties</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage political parties</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-smooth font-semibold shadow-md"
          >
            <FiPlus />
            Create Party
          </button>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 animate-fadeIn transition-colors">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search parties..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
            />
          </div>
        </div>

        {/* Parties Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-fadeIn transition-colors">
          {loading ? (
            <TableSkeleton rows={10} columns={4} />
          ) : parties.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiImage className="text-gray-400 dark:text-gray-500" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Parties Found</h3>
              <p className="text-gray-600 dark:text-gray-400">Create your first party to get started</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Logo</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Name</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Description</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Candidates</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parties.map((party, index) => (
                      <tr 
                        key={party.id} 
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                            {party.logo ? (
                              <img 
                                src={party.logo} 
                                alt={party.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'text-gray-400 dark:text-gray-500 text-xs text-center';
                                  placeholder.textContent = 'No logo';
                                  e.target.parentElement.appendChild(placeholder);
                                }}
                              />
                            ) : (
                              <FiImage className="text-gray-400 dark:text-gray-500" size={24} />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{party.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {party.description || 'No description'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {party.candidate_count || 0} candidates
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewCandidates(party)}
                              className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-xl transition-smooth"
                              title="View Candidates"
                            >
                              <FiUsers />
                            </button>
                            <button
                              onClick={() => handleEdit(party)}
                              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xl transition-smooth"
                              title="Edit Party"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDelete(party.id)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xl transition-smooth"
                              title="Delete Party"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth font-semibold shadow-sm"
                >
                  Previous
                </button>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Page {page} of {Math.ceil(total / 20)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 20)}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-smooth font-semibold shadow-md"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPartiesEnhanced;
