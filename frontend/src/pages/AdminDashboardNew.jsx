import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiFileText, FiUserPlus, FiTrash2, FiEdit, FiPlay, FiPause } from 'react-icons/fi';

const AdminDashboardNew = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [electionStatus, setElectionStatus] = useState('inactive');
  const [loading, setLoading] = useState(false);

  // Form states
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '' });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'voter' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, candidatesRes, statusRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAllCandidates(),
        adminAPI.getElectionStatus()
      ]);
      
      setStats(dashboardRes.data);
      setCandidates(candidatesRes.data.candidates || []);
      setElectionStatus(statusRes.data.status);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!newCandidate.name || !newCandidate.party) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await adminAPI.createCandidate(newCandidate);
      toast.success('Candidate added successfully');
      setNewCandidate({ name: '', party: '' });
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add candidate');
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await adminAPI.deleteCandidate(id);
      toast.success('Candidate deleted successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete candidate');
    }
  };

  const handleToggleElection = async () => {
    try {
      if (electionStatus === 'active') {
        await adminAPI.stopElection();
        toast.success('Election stopped');
      } else {
        await adminAPI.startElection();
        toast.success('Election started');
      }
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to toggle election status');
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Manage elections, users, and candidates</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('elections')}
              className={`${
                activeTab === 'elections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Elections
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              className={`${
                activeTab === 'candidates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Candidates
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Users
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6 pb-12">
          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FiUsers className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                          <dd className="text-3xl font-semibold text-gray-900">{stats.users?.total_users || 0}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FiFileText className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Candidates</dt>
                          <dd className="text-3xl font-semibold text-gray-900">{stats.candidates || 0}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FiUsers className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Verified Voters</dt>
                          <dd className="text-3xl font-semibold text-gray-900">{stats.users?.verified_voters || 0}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FiFileText className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Votes</dt>
                          <dd className="text-3xl font-semibold text-gray-900">{stats.votes || 0}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Election Status */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Election Control</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Current Status:</p>
                    <p className={`text-2xl font-bold ${electionStatus === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                      {electionStatus === 'active' ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleElection}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white ${
                      electionStatus === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {electionStatus === 'active' ? <><FiPause /> Stop Election</> : <><FiPlay /> Start Election</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Elections Tab */}
          {activeTab === 'elections' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Election Management</h2>
              
              <div className="mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-lg font-semibold">Current Election Status</h3>
                    <p className={`text-2xl font-bold mt-2 ${electionStatus === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                      {electionStatus === 'active' ? 'Active - Voting Open' : 'Inactive - Voting Closed'}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleElection}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white ${
                      electionStatus === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {electionStatus === 'active' ? <><FiPause /> Stop Election</> : <><FiPlay /> Start Election</>}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Total Candidates</p>
                  <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Total Votes Cast</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.votes || 0}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Eligible Voters</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.users?.verified_voters || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* Candidates Tab */}
          {activeTab === 'candidates' && (
            <div className="space-y-6">
              {/* Add Candidate Form */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Candidate</h2>
                <form onSubmit={handleAddCandidate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Candidate Name"
                    value={newCandidate.name}
                    onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Party Name"
                    value={newCandidate.party}
                    onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                  >
                    <FiUserPlus /> Add Candidate
                  </button>
                </form>
              </div>

              {/* Candidates List */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-xl font-bold text-gray-900">All Candidates</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {candidates.map((candidate) => (
                        <tr key={candidate.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{candidate.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.party}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.votes}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteCandidate(candidate.id)}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1"
                            >
                              <FiTrash2 /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">User Management</h2>
              <p className="text-gray-600">User management features coming soon. Currently showing {stats?.users?.total_users || 0} total users.</p>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-600">{stats?.users?.total_users || 0}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Verified Voters</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.users?.verified_voters || 0}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-purple-600">{stats?.users?.total_admins || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardNew;
