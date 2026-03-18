import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import useAuthStore from '../contexts/authStore';
import toast from 'react-hot-toast';
import { FiUsers, FiFileText, FiCheckSquare, FiClock, FiLogOut, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { StatCardSkeleton, DashboardSkeleton } from '../components/LoadingSkeleton';

const AdminDashboardEnhanced = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load dashboard</p>
        <button 
          onClick={fetchDashboard} 
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-smooth"
        >
          Retry
        </button>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color, trend, bgGradient }) => (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-xl shadow-lg p-6 card-hover animate-fadeIn`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium mb-1">{label}</p>
          <p className="text-white text-3xl font-bold">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-white/90 text-sm">
              <FiTrendingUp className="mr-1" size={14} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
          <Icon className="text-white" size={28} />
        </div>
      </div>
    </div>
  );

  const verificationRate = stats.users?.verified_voters && stats.users?.total_users
    ? ((stats.users.verified_voters / (stats.users.verified_voters + stats.users.unverified_voters)) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="animate-slideIn">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.name || 'Admin'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-smooth font-semibold shadow-md"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            icon={FiFileText}
            label="Total Elections"
            value={(stats.elections?.draft || 0) + (stats.elections?.active || 0) + (stats.elections?.completed || 0)}
            bgGradient="from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700"
            trend={`${stats.elections?.active || 0} active`}
          />
          <StatCard
            icon={FiUsers}
            label="Total Parties"
            value={stats.parties || 0}
            bgGradient="from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700"
          />
          <StatCard
            icon={FiCheckSquare}
            label="Total Candidates"
            value={stats.candidates || 0}
            bgGradient="from-green-500 to-green-600 dark:from-green-600 dark:to-green-700"
          />
          <StatCard
            icon={FiUsers}
            label="Total Voters"
            value={(stats.users?.verified_voters || 0) + (stats.users?.unverified_voters || 0)}
            bgGradient="from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700"
            trend={`${verificationRate}% verified`}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3 mb-8">
          {/* User Statistics */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 card-hover animate-fadeIn transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FiUsers className="text-blue-500" />
              User Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4 transition-colors">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Admin Users</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.users?.total_admins || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-4 transition-colors">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Voters</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {(stats.users?.total_users || 0) - (stats.users?.total_admins || 0)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-lg p-4 transition-colors">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Unverified Voters</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{stats.users?.unverified_voters || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-4 transition-colors">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Verification Rate</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{verificationRate}%</p>
              </div>
            </div>
          </div>

          {/* Election Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 card-hover animate-fadeIn transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FiFileText className="text-purple-500" />
              Elections
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <FiClock className="text-blue-500 dark:text-blue-400 text-xl" />
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">Draft</span>
                </div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.elections?.draft || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <FiCheckSquare className="text-green-500 dark:text-green-400 text-xl" />
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">Active</span>
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.elections?.active || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <FiCheckSquare className="text-orange-500 dark:text-orange-400 text-xl" />
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">Completed</span>
                </div>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.elections?.completed || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Note: Elections by Type section removed - elections are now managed through categories */}

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 card-hover animate-fadeIn transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activities</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">User</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Action</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Entity</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_activities && stats.recent_activities.length > 0 ?
                  stats.recent_activities.map((activity, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{activity.user_name || 'System'}</td>
                      <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">{activity.action}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{activity.entity_type}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )) :
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">No recent activities</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <a
            href="/admin/elections"
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-4 rounded-lg transition-smooth font-semibold shadow-md card-hover"
          >
            <FiFileText />
            Manage Elections
          </a>
          <a
            href="/admin/parties"
            className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-6 py-4 rounded-lg transition-smooth font-semibold shadow-md card-hover"
          >
            <FiUsers />
            Manage Parties
          </a>
          <a
            href="/admin/candidates"
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-6 py-4 rounded-lg transition-smooth font-semibold shadow-md card-hover"
          >
            <FiCheckSquare />
            Manage Candidates
          </a>
          <a
            href="/admin/users"
            className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white px-6 py-4 rounded-lg transition-smooth font-semibold shadow-md card-hover"
          >
            <FiUsers />
            Manage Users
          </a>
          <a
            href="/admin/voters"
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-6 py-4 rounded-lg transition-smooth font-semibold shadow-md card-hover"
          >
            <FiCheckSquare />
            Voter Status
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardEnhanced;
