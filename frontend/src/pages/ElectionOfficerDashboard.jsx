import React, { useState } from 'react';
import { FiBarChart2, FiUsers, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ElectionOfficerDashboard = () => {
  const [stats] = useState({
    assignedElections: 5,
    activeElections: 2,
    completedElections: 2,
    totalVotes: 15234,
    voterTurnout: 68.5
  });

  const [elections] = useState([
    {
      id: 1,
      title: 'Municipal Elections 2024',
      status: 'active',
      startDate: '2024-02-15',
      endDate: '2024-02-20',
      votes: 8234,
      candidates: 12,
      voterTurnout: 72
    },
    {
      id: 2,
      title: 'State Assembly Elections',
      status: 'active',
      startDate: '2024-03-01',
      endDate: '2024-03-10',
      votes: 7000,
      candidates: 48,
      voterTurnout: 65
    },
    {
      id: 3,
      title: 'Board Division Elections',
      status: 'completed',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      votes: 2500,
      candidates: 8,
      voterTurnout: 58
    }
  ]);

  const statCards = [
    {
      title: 'Assigned Elections',
      value: stats.assignedElections,
      icon: <FiBarChart2 size={24} />,
      color: 'bg-blue-500',
      changeText: '+2 from last month'
    },
    {
      title: 'Active Elections',
      value: stats.activeElections,
      icon: <FiCheckCircle size={24} />,
      color: 'bg-green-500',
      changeText: 'Currently monitoring'
    },
    {
      title: 'Total Votes Cast',
      value: stats.totalVotes.toLocaleString(),
      icon: <FiUsers size={24} />,
      color: 'bg-purple-500',
      changeText: 'Across all elections'
    },
    {
      title: 'Avg Voter Turnout',
      value: `${stats.voterTurnout}%`,
      icon: <FiAlertCircle size={24} />,
      color: 'bg-orange-500',
      changeText: 'Above target (60%)'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Election Officer Dashboard</h1>
          <p className="text-gray-600">Monitor and manage electoral activities in real-time</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} text-white p-3 rounded-lg`}>
                  {card.icon}
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-800 mb-2">{card.value}</p>
              <p className="text-xs text-gray-500">{card.changeText}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/election-officer/monitoring" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:shadow-lg transition text-center">
              <FiBarChart2 size={28} className="mx-auto mb-2" />
              <p className="font-semibold">Monitor Elections</p>
              <p className="text-sm opacity-90">Real-time voting updates</p>
            </Link>
            <Link to="/election-officer/reports" className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg hover:shadow-lg transition text-center">
              <FiCheckCircle size={28} className="mx-auto mb-2" />
              <p className="font-semibold">Generate Reports</p>
              <p className="text-sm opacity-90">Export election data</p>
            </Link>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg hover:shadow-lg transition text-center cursor-pointer">
              <FiAlertCircle size={28} className="mx-auto mb-2" />
              <p className="font-semibold">Security Alerts</p>
              <p className="text-sm opacity-90">Monitor suspicious activities</p>
            </div>
          </div>
        </div>

        {/* Assigned Elections List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Assigned Elections</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Election Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Votes</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Turnout</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Candidates</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {elections.map((election) => (
                  <tr key={election.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{election.title}</p>
                      <p className="text-sm text-gray-500">{election.startDate} to {election.endDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        election.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {election.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{election.votes.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${election.voterTurnout}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold">{election.voterTurnout}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-800">{election.candidates}</td>
                    <td className="px-6 py-4">
                      <Link 
                        to={`/election-officer/monitoring/${election.id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionOfficerDashboard;
