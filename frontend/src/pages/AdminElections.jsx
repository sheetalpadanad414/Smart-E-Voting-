import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiEye } from 'react-icons/fi';

const AdminElections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    is_public: true
  });

  // fetchElections intentionally run when `page` or `filters` change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchElections();
  }, [page, filters]);

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
        is_public: true
      });
      setShowForm(false);
      fetchElections();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {editingId ? 'Edit Election' : 'Create New Election'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium text-gray-700">Make Public</span>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingId ? 'Update Election' : 'Create Election'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    title: '',
                    description: '',
                    start_date: '',
                    end_date: '',
                    is_public: true
                  });
                }}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition"
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Elections</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2 font-semibold"
          >
            <FiPlus /> Create Election
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ status: e.target.value });
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : elections.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No elections found</div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-6 py-3 text-left font-semibold">Title</th>
                    <th className="px-6 py-3 text-left font-semibold">Start Date</th>
                    <th className="px-6 py-3 text-left font-semibold">End Date</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    <th className="px-6 py-3 text-left font-semibold">Type</th>
                    <th className="px-6 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {elections.map((election) => (
                    <tr key={election.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3 font-semibold text-gray-800">{election.title}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {new Date(election.start_date).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {new Date(election.end_date).toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          election.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                          election.status === 'active' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {election.status}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          election.is_public ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {election.is_public ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="px-6 py-3 flex gap-2">
                        <a
                          href={`/admin/elections/${election.id}`}
                          className="text-green-500 hover:text-green-700 text-xl"
                        >
                          <FiEye />
                        </a>
                        <a
                          href={`/admin/candidates/${election.id}`}
                          className="text-purple-500 hover:text-purple-700 text-sm font-semibold"
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
                              is_public: election.is_public
                            });
                            setShowForm(true);
                          }}
                          className="text-blue-500 hover:text-blue-700 text-xl"
                        >
                          <FiEdit2 />
                        </button>
                        {election.status === 'draft' && (
                          <button
                            onClick={() => handleDeleteElection(election.id)}
                            className="text-red-500 hover:text-red-700 text-xl"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-center gap-2 p-6 border-t">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {Math.ceil(total / 10)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
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

export default AdminElections;
