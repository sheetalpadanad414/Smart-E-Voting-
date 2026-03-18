import React, { useEffect, useState } from 'react';
import { partyAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiImage } from 'react-icons/fi';

const AdminParties = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    description: ''
  });

  useEffect(() => {
    fetchParties();
  }, [page, searchTerm]);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const response = await partyAPI.getAllParties(page, 20, searchTerm);
      setParties(response.data.parties);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Failed to load parties');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParty = async (id) => {
    if (window.confirm('Are you sure you want to delete this party? This will fail if candidates are associated with it.')) {
      try {
        await partyAPI.deleteParty(id);
        toast.success('Party deleted successfully');
        fetchParties();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete party');
      }
    }
  };

  const handleEditParty = (party) => {
    setFormData({
      name: party.name,
      logo_url: party.logo_url || '',
      description: party.description || ''
    });
    setEditingId(party.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Party name is required');
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await partyAPI.updateParty(editingId, formData);
        toast.success('Party updated successfully');
        setEditingId(null);
      } else {
        await partyAPI.createParty(formData);
        toast.success('Party created successfully');
      }
      
      resetForm();
      setShowForm(false);
      fetchParties();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      description: ''
    });
  };

  const handleNewParty = () => {
    setEditingId(null);
    resetForm();
    setShowForm(true);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {editingId ? 'Edit Party' : 'Add New Party'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Party Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                placeholder="Enter party name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Party Logo URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                  placeholder="https://example.com/logo.png"
                />
                {formData.logo_url && (
                  <div className="w-16 h-16 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                    <img 
                      src={formData.logo_url} 
                      alt="Preview" 
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<FiImage className="text-gray-400" size={24} />';
                      }}
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter a direct URL to the party logo image
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                placeholder="Enter party description"
                rows="4"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-smooth font-semibold shadow-md disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingId ? 'Update Party' : 'Create Party'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-smooth font-semibold"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Parties</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage political parties</p>
          </div>
          <button
            onClick={handleNewParty}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-smooth font-semibold shadow-md"
          >
            <FiPlus /> Add Party
          </button>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 bg-gray-50 dark:bg-gray-700">
            <FiSearch className="text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search parties by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="flex-1 ml-2 py-3 outline-none bg-transparent text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Parties Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600 dark:text-gray-400">Loading parties...</p>
          </div>
        ) : parties.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <FiImage className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Parties Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm ? 'No parties match your search' : 'Get started by creating your first party'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleNewParty}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-smooth font-semibold shadow-md"
              >
                Create First Party
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {parties.map((party) => (
                <div 
                  key={party.id} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 card-hover transition-colors"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {party.logo_url ? (
                      <div className="w-16 h-16 flex-shrink-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700">
                        <img 
                          src={party.logo_url} 
                          alt={party.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><FiImage size={24} /></div>';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 flex-shrink-0 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                        <FiImage className="text-gray-400 dark:text-gray-500" size={24} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {party.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {party.candidate_count || 0} candidate{party.candidate_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {party.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {party.description}
                    </p>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleEditParty(party)}
                      className="flex-1 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-4 py-2 rounded-lg transition-smooth font-semibold"
                    >
                      <FiEdit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteParty(party.id)}
                      className="flex-1 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 px-4 py-2 rounded-lg transition-smooth font-semibold"
                    >
                      <FiTrash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {total > 20 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth font-semibold shadow-sm"
                >
                  Previous
                </button>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Page {page} of {Math.ceil(total / 20)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 20)}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-smooth font-semibold shadow-md"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminParties;
