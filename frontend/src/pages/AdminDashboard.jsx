import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiFileText, FiCheckSquare, FiClock } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!stats) {
    return <div className="flex items-center justify-center min-h-screen">No data available</div>;
  }

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`${color} text-white p-4 rounded-lg text-2xl`}>
          <Icon />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            icon={FiUsers}
            label="Total Users"
            value={stats.users?.total_users || 0}
            color="bg-blue-500"
          />
          <StatCard
            icon={FiUsers}
            label="Verified Voters"
            value={stats.users?.verified_voters || 0}
            color="bg-green-500"
          />
          <StatCard
            icon={FiFileText}
            label="Active Elections"
            value={stats.elections?.active || 0}
            color="bg-purple-500"
          />
          <StatCard
            icon={FiCheckSquare}
            label="Completed Elections"
            value={stats.elections?.completed || 0}
            color="bg-orange-500"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">User Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Admin Users</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{stats.users?.total_admins || 0}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Total Voters</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{stats.users?.total_users - stats.users?.total_admins || 0}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Unverified Voter</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.users?.unverified_voters || 0}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Verification Rate</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  {((stats.users?.verified_voters / (stats.users?.verified_voters + stats.users?.unverified_voters)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Election Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiClock className="text-blue-500 text-xl" />
                  <span className="text-gray-700 font-semibold">Draft</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{stats.elections?.draft || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiCheckSquare className="text-green-500 text-xl" />
                  <span className="text-gray-700 font-semibold">Active</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{stats.elections?.active || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiCheckSquare className="text-orange-500 text-xl" />
                  <span className="text-gray-700 font-semibold">Completed</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">{stats.elections?.completed || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activities</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-3 text-left font-semibold">User</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                  <th className="px-4 py-3 text-left font-semibold">Entity</th>
                  <th className="px-4 py-3 text-left font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_activities && stats.recent_activities.length > 0 ?
                  stats.recent_activities.map((activity, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{activity.user_name || 'System'}</td>
                      <td className="px-4 py-3 font-semibold text-blue-600">{activity.action}</td>
                      <td className="px-4 py-3 text-gray-600">{activity.entity_type}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )) :
                  <tr>
                    <td colSpan="4" className="px-4 py-3 text-center text-gray-600">No recent activities</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="/admin/elections"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            Manage Elections
          </a>
          <a
            href="/admin/users"
            className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-semibold"
          >
            Manage Users
          </a>
          <a
            href="/admin/candidates"
            className="inline-block bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition font-semibold"
          >
            Manage Candidates
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
