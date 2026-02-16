import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import useAuthStore from '../contexts/authStore';
import toast from 'react-hot-toast';
import { 
  FiHome, FiUsers, FiFileText, FiUserCheck, FiPlay, FiPause, 
  FiTrash2, FiPlus, FiLogOut, FiMenu, FiX 
} from 'react-icons/fi';

const AdminDashboardComplete = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  // Data states
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [users, setUsers] = useState([]);
  const [electionStatus, setElectionStatus] = useState('inactive');

  // Form states
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, candidatesRes, statusRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAllCandidates(),
        adminAPI.getElectionStatus()
      ]);
      
      setStats(dashboardRes.data);
      setCandidates(candidatesRes.data.data?.candidates || candidatesRes.data.candidates || []);
      setElectionStatus(statusRes.data.data?.status || statusRes.data.status);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
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
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add candidate');
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await adminAPI.deleteCandidate(id);
      toast.success('Candidate deleted successfully');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete candidate');
    }
  };

  const handleToggleElection = async () => {
    try {
      if (electionStatus === 'active') {
        await adminAPI.stopElection();
        toast.success('Election stopped successfully');
      } else {
        if (candidates.length === 0) {
          toast.error('Please add candidates before starting election');
          return;
        }
        await adminAPI.startElection();
        toast.success('Election started successfully');
      }
      fetchAllData();
    } catch (error) {
      toast.error('Failed to toggle election status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div className={`${bgColor} rounded-lg p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} p-4 rounded-lg`}>
          <Icon className="text-white text-2xl" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-blue-600 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-blue-500">
          {sidebarOpen && <h1 className="text-xl font-bold">Smart E-Voting</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-blue-500 rounded">
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition ${
              activeSection === 'dashboard' ? 'bg-blue-500' : 'hover:bg-blue-500'
            }`}
          >
            <FiHome className="text-xl" />
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => setActiveSection('users')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition ${
              activeSection === 'users' ? 'bg-blue-500' : 'hover:bg-blue-500'
            }`}
          >
            <FiUsers className="text-xl" />
            {sidebarOpen && <span>Users</span>}
          </button>

          <button
            onClick={() => setActiveSection('elections')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition ${
              activeSection === 'elections' ? 'bg-blue-500' : 'hover:bg-blue-500'
            }`}
          >
            <FiFileText className="text-xl" />
            {sidebarOpen && <span>Elections</span>}
          </button>

          <button
            onClick={() => setActiveSection('candidates')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition ${
              activeSection === 'candidates' ? 'bg-blue-500' : 'hover:bg-blue-500'
            }`}
          >
            <FiUserCheck className="text-xl" />
            {sidebarOpen && <span>Candidates</span>}
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-blue-500">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-500 transition"
          >
            <FiLogOut className="text-xl" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeSection === 'dashboard' && 'Admin Dashboard'}
            {activeSection === 'users' && 'User Management'}
            {activeSection === 'elections' && 'Election Management'}
            {activeSection === 'candidates' && 'Candidate Management'}
          </h2>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name || 'Admin'}</p>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {loading && !stats ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-xl text-gray-600">Loading...</div>
            </div>
          ) : (
            <>
              {/* Dashboard Section */}
              {activeSection === 'dashboard' && stats && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      icon={FiUsers}
                      title="Total Users"
                      value={stats.users?.total_users || 0}
                      color="bg-blue-500"
                      bgColor="bg-blue-50"
                    />
                    <StatCard
                      icon={FiUserCheck}
                      title="Verified Voters"
                      value={stats.users?.verified_voters || 0}
                      color="bg-green-500"
                      bgColor="bg-green-50"
                    />
                    <StatCard
                      icon={FiFileText}
                      title="Total Candidates"
                      value={stats.candidates || 0}
                      color="bg-purple-500"
                      bgColor="bg-purple-50"
                    />
                    <StatCard
                      icon={FiFileText}
                      title="Total Votes"
                      value={stats.votes || 0}
                      color="bg-orange-500"
                      bgColor="bg-orange-50"
                    />
                  </div>

                  {/* Election Status Card */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Election Status</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Current Status</p>
                        <p className={`text-2xl font-bold mt-1 ${
                          electionStatus === 'active' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {electionStatus === 'active' ? 'Active - Voting Open' : 'Inactive - Voting Closed'}
                        </p>
                      </div>
                      <button
                        onClick={handleToggleElection}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition ${
                          electionStatus === 'active' 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {electionStatus === 'active' ? (
                          <><FiPause /> Stop Election</>
                        ) : (
                          <><FiPlay /> Start Election</>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Admin Users</h4>
                      <p className="text-3xl font-bold text-blue-600">{stats.users?.total_admins || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Unverified Voters</h4>
                      <p className="text-3xl font-bold text-yellow-600">{stats.users?.unverified_voters || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Voter Turnout</h4>
                      <p className="text-3xl font-bold text-purple-600">
                        {stats.users?.verified_voters > 0 
                          ? Math.round((stats.votes / stats.users.verified_voters) * 100) 
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Section */}
              {activeSection === 'users' && (
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">User Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Total Users</p>
                        <p className="text-4xl font-bold text-blue-600">{stats?.users?.total_users || 0}</p>
                      </div>
                      <div className="p-6 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Verified Voters</p>
                        <p className="text-4xl font-bold text-green-600">{stats?.users?.verified_voters || 0}</p>
                      </div>
                      <div className="p-6 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Admin Users</p>
                        <p className="text-4xl font-bold text-purple-600">{stats?.users?.total_admins || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Elections Section */}
              {activeSection === 'elections' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-6">Election Control</h3>
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Current Status</p>
                        <p className={`text-3xl font-bold mt-2 ${
                          electionStatus === 'active' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {electionStatus === 'active' ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <button
                        onClick={handleToggleElection}
                        className={`flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-white text-lg transition ${
                          electionStatus === 'active' 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {electionStatus === 'active' ? (
                          <><FiPause className="text-xl" /> Stop Election</>
                        ) : (
                          <><FiPlay className="text-xl" /> Start Election</>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <p className="text-sm text-gray-600 mb-2">Total Candidates</p>
                      <p className="text-3xl font-bold text-gray-900">{candidates.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <p className="text-sm text-gray-600 mb-2">Votes Cast</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.votes || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <p className="text-sm text-gray-600 mb-2">Eligible Voters</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.users?.verified_voters || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Candidates Section */}
              {activeSection === 'candidates' && (
                <div className="space-y-6">
                  {/* Add Candidate Form */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-4">Add New Candidate</h3>
                    <form onSubmit={handleAddCandidate} className="flex gap-4">
                      <input
                        type="text"
                        placeholder="Candidate Name"
                        value={newCandidate.name}
                        onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Party Name"
                        value={newCandidate.party}
                        onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
                      >
                        <FiPlus /> Add Candidate
                      </button>
                    </form>
                  </div>

                  {/* Candidates Table */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b">
                      <h3 className="text-xl font-semibold">All Candidates ({candidates.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Candidate Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Party
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Votes
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {candidates.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                No candidates added yet. Add your first candidate above.
                              </td>
                            </tr>
                          ) : (
                            candidates.map((candidate) => (
                              <tr key={candidate.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">{candidate.party}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-semibold text-gray-900">{candidate.votes}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button
                                    onClick={() => handleDeleteCandidate(candidate.id)}
                                    className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                  >
                                    <FiTrash2 /> Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardComplete;
