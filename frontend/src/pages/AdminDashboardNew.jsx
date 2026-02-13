import React, { useState } from 'react';
import { FiBarChart2, FiUsers, FiVote, FiTrendingUp, FiCalendar, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats] = useState({
    totalUsers: 2847,
    totalVoters: 2654,
    totalAdmins: 193,
    activeElections: 8,
    completedElections: 24,
    totalVotes: 15342,
    verifiedUsers: 2741,
    pendingVerification: 106
  });

  const [recentActivities] = useState([
    { id: 1, user: 'John Doe', action: 'Voted in Class President Election', time: '2 minutes ago', type: 'vote' },
    { id: 2, user: 'Admin User', action: 'Created new election: Sports Committee', time: '15 minutes ago', type: 'election' },
    { id: 3, user: 'Jane Smith', action: 'Registered account', time: '1 hour ago', type: 'registration' },
    { id: 4, user: 'Robert Johnson', action: 'Verified email', time: '2 hours ago', type: 'verification' },
    { id: 5, user: 'Sarah Williams', action: 'Voted in Student Council Election', time: '3 hours ago', type: 'vote' },
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your election statistics.</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users Card */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-2">↑ 12% from last month</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiUsers size={28} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Elections */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Active Elections</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeElections}</p>
              <p className="text-xs text-green-600 mt-2">Running currently</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiVote size={28} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Votes */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Votes Cast</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalVotes.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-2">↑ 8% this week</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiBarChart2 size={28} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Verified Users */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Verified Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.verifiedUsers}</p>
              <p className="text-xs text-orange-600 mt-2">{stats.pendingVerification} pending</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <FiShield size={28} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl shadow-md p-6">
          <p className="text-blue-100 text-sm mb-2">Total Voters</p>
          <p className="text-3xl font-bold">{stats.totalVoters.toLocaleString()}</p>
          <p className="text-blue-100 text-xs mt-3">Eligible to vote</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl shadow-md p-6">
          <p className="text-green-100 text-sm mb-2">Completed Elections</p>
          <p className="text-3xl font-bold">{stats.completedElections}</p>
          <p className="text-green-100 text-xs mt-3">Successfully completed</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl shadow-md p-6">
          <p className="text-purple-100 text-sm mb-2">System Uptime</p>
          <p className="text-3xl font-bold">99.9%</p>
          <p className="text-purple-100 text-xs mt-3">Last 30 days</p>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <FiTrendingUp className="text-blue-600" />
            <span>Recent Activities</span>
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'vote' ? 'bg-green-100' :
                  activity.type === 'election' ? 'bg-blue-100' :
                  activity.type === 'registration' ? 'bg-purple-100' :
                  'bg-orange-100'
                }`}>
                  <FiVote className={`${
                    activity.type === 'vote' ? 'text-green-600' :
                    activity.type === 'election' ? 'text-blue-600' :
                    activity.type === 'registration' ? 'text-purple-600' :
                    'text-orange-600'
                  }`} size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 whitespace-nowrap ml-4">{activity.time}</p>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-gray-50 text-center border-t border-gray-200">
          <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">View All Activities</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
