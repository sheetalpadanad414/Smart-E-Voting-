import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminAPI, locationAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiEye, FiMapPin, FiFilter, FiX } from 'react-icons/fi';
import LocationDropdown from '../components/LocationDropdown';
import { TableSkeleton } from '../components/LoadingSkeleton';

const AdminElectionsEnhanced = () => {
  const [searchParams] = useSearchParams();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ 
    status: '',
    country_id: '',
    state_id: '',
    election_type: '',
    election_subtype: ''
  });
  const [countries, setCountries] = useState([]);
  const [filterStates, setFilterStates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    is_public: true,
    country_id: null,
    state_id: null,
    election_type: '',
    election_subtype: ''
  });

  const ELECTION_TYPES = {
    'Lok Sabha': ['General', 'By-Election'],
    'Rajya Sabha': ['Regular', 'By-Election'],
    'State Assembly': ['General', 'Re-Poll'],
    'Local Body': ['Panchayat', 'Municipal', 'Ward'],
    'Presidential': ['Regular', 'Re-Election']
  };

  // Initialize filters from URL parameters
  useEffect(() => {
    const typeParam = searchParams.get('type');
    const categoryParam = searchParams.get('category');
    
    if (typeParam) {
      setFilters(prev => ({ ...prev, election_type: typeParam }));
    }
    // Category filtering can be added if needed
  }, [searchParams]);

  useEffect(() => {
    fetchElections();
  }, [page, filters]);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (filters.country_id) {
      fetchFilterStates(filters.country_id);
    } else {
      setFilterStates([]);
    }
  }, [filters.country_id]);

  const fetchCountries = async () => {
    try {
      const response = await locationAPI.getAllCountries();
      setCountries(response.data.countries);
    } catch (error) {
      console.error('Failed to load countries');
    }
  };

  const fetchFilterStates = async (countryId) => {
    try {
      const response = await locationAPI.getStatesByCountry(countryId);
      setFilterStates(response.data.states);
    } catch (error) {
      console.error('Failed to load states');
    }
  };

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllElections(page, 10, filters);
      setElections(response.data.elections);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteElection = async (id) => {
    if (window.confirm('Are you sure? This will delete all related candidates and votes.')) {
      try {
        await adminAPI.deleteElection(id);
        toast.success('Election deleted successfully');
        fetchElections();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete election');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        await adminAPI.updateElection(editingId, formData);
        toast.success('Election updated successfully');
        setEditingId(null);
      } else {
        await adminAPI.createElection(formData);
        toast.success('Election created successfully');
      }
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        is_public: true,
        country_id: null,
        state_id: null,
        election_type: '',
        election_subtype: ''
      });
      setShowForm(false);
      fetchElections();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      country_id: '',
      state_id: '',
      election_type: '',
      election_subtype: ''
    });
    setPage(1);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Election' : 'Create New Election'}
              </h1>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-smooth"
              >
                <FiX size={24} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                  required
                  placeholder="Enter election title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth min-h-24"
                  placeholder="Enter election description"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Election Type (Optional)
                  </label>
                  <select
                    value={formData.election_type}
                    onChange={(e) => setFormData({ ...formData, election_type: e.target.value, election_subtype: '' })}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                  >
                    <option value="">Select Type</option>
                    {Object.keys(ELECTION_TYPES).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Election Subtype (Optional)
                  </label>
                  <select
                    value={formData.election_subtype}
                    onChange={(e) => setFormData({ ...formData, election_subtype: e.target.value })}
                    disabled={!formData.election_type}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">{!formData.election_type ? 'Select type first' : 'Select Subtype'}</option>
                    {formData.election_type && ELECTION_TYPES[formData.election_type]?.map((subtype) => (
                      <option key={subtype} value={subtype}>{subtype}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Make Public</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location Restriction (Optional)
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Leave empty for no restrictions. Select country/state to restrict voting to specific locations.
                </p>
                <LocationDropdown
                  countryId={formData.country_id}
                  stateId={formData.state_id}
                  onCountryChange={(value) => setFormData(prev => ({ ...prev, country_id: value, state_id: null }))}
                  onStateChange={(value) => setFormData(prev => ({ ...prev, state_id: value }))}
                  required={false}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-smooth disabled:opacity-50 shadow-md"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Election' : 'Create Election'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Elections</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage elections</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-smooth font-semibold shadow-md"
          >
            <FiPlus />
            Create Election
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 animate-fadeIn transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiFilter />
              Filters
            </h3>
            {(filters.status || filters.country_id || filters.state_id || filters.election_type) && (
              <button
                onClick={resetFilters}
                className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-smooth"
              >
                Reset Filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value });
                  setPage(1);
                }}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Election Type</label>
              <select
                value={filters.election_type}
                onChange={(e) => {
                  setFilters({ ...filters, election_type: e.target.value, election_subtype: '' });
                  setPage(1);
                }}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
              >
                <option value="">All Types</option>
                {Object.keys(ELECTION_TYPES).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subtype</label>
              <select
                value={filters.election_subtype}
                onChange={(e) => {
                  setFilters({ ...filters, election_subtype: e.target.value });
                  setPage(1);
                }}
                disabled={!filters.election_type}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth disabled:opacity-50"
              >
                <option value="">{!filters.election_type ? 'Select type first' : 'All Subtypes'}</option>
                {filters.election_type && ELECTION_TYPES[filters.election_type]?.map((subtype) => (
                  <option key={subtype} value={subtype}>{subtype}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
              <select
                value={filters.country_id}
                onChange={(e) => {
                  setFilters({ ...filters, country_id: e.target.value, state_id: '' });
                  setPage(1);
                }}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>{country.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State</label>
              <select
                value={filters.state_id}
                onChange={(e) => {
                  setFilters({ ...filters, state_id: e.target.value });
                  setPage(1);
                }}
                disabled={!filters.country_id}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth disabled:opacity-50"
              >
                <option value="">{!filters.country_id ? 'Select country first' : 'All States'}</option>
                {filterStates.map((state) => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Elections Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-fadeIn transition-colors">
          {loading ? (
            <TableSkeleton rows={10} columns={7} />
          ) : elections.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiEye className="text-gray-400 dark:text-gray-500" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Elections Found</h3>
              <p className="text-gray-600 dark:text-gray-400">Create your first election to get started</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Title</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Type</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Start Date</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">End Date</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Location</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elections.map((election, index) => (
                      <tr 
                        key={election.id} 
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{election.title}</td>
                        <td className="px-6 py-4">
                          {election.election_type ? (
                            <div className="text-xs">
                              <div className="font-semibold text-indigo-600 dark:text-indigo-400">{election.election_type}</div>
                              {election.election_subtype && (
                                <div className="text-gray-500 dark:text-gray-400">{election.election_subtype}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500">Not specified</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(election.start_date).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(election.end_date).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            election.status === 'draft' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                            election.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {election.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {election.country_name || election.state_name ? (
                            <div className="flex items-center gap-1">
                              <FiMapPin className="text-blue-500 dark:text-blue-400 text-sm" />
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                {election.state_name ? `${election.country_name} - ${election.state_name}` : election.country_name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500">Global</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <a
                              href={`/admin/candidates/${election.id}`}
                              className="text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-semibold transition-smooth"
                            >
                              Candidates
                            </a>
                            <button
                              onClick={() => {
                                setEditingId(election.id);
                                setFormData({
                                  title: election.title,
                                  description: election.description,
                                  start_date: election.start_date,
                                  end_date: election.end_date,
                                  is_public: election.is_public,
                                  country_id: election.country_id || null,
                                  state_id: election.state_id || null,
                                  election_type: election.election_type || '',
                                  election_subtype: election.election_subtype || ''
                                });
                                setShowForm(true);
                              }}
                              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xl transition-smooth"
                            >
                              <FiEdit2 />
                            </button>
                            {election.status === 'draft' && (
                              <button
                                onClick={() => handleDeleteElection(election.id)}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xl transition-smooth"
                              >
                                <FiTrash2 />
                              </button>
                            )}
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
                  Page {page} of {Math.ceil(total / 10)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 10)}
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

export default AdminElectionsEnhanced;
