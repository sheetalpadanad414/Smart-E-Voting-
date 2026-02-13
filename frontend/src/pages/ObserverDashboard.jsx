import React, { useState } from 'react';
import { FiEye, FiBarChart2, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ObserverDashboard = () => {
  const [elections] = useState([
    {
      id: 1,
      title: 'Municipal Elections 2024',
      status: 'completed',
      startDate: '2024-02-15',
      endDate: '2024-02-20',
      votes: 8234,
      candidates: 12,
      turnout: 72,
      leader: 'Candidate A',
      leaderVotes: 3200
    },
    {
      id: 2,
      title: 'State Assembly Elections',
      status: 'active',
      startDate: '2024-03-01',
      endDate: '2024-03-10',
      votes: 7000,
      candidates: 48,
      turnout: 65,
      leader: 'Candidate B',
      leaderVotes: 2800
    },
    {
      id: 3,
      title: 'Board Division Elections',
      status: 'completed',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      votes: 2500,
      candidates: 8,
      turnout: 58,
      leader: 'Candidate C',
      leaderVotes: 950
    }
  ]);

  const stats = [
    {
      title: 'Elections Observed',
      value: elections.length,
      icon: <FiEye size={24} />,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Votes Tracked',
      value: elections.reduce((sum, e) => sum + e.votes, 0).toLocaleString(),
      icon: <FiCheckCircle size={24} />,
      color: 'bg-green-500'
    },
    {
      title: 'Avg Voter Turnout',
      value: `${Math.round(elections.reduce((sum, e) => sum + e.turnout, 0) / elections.length)}%`,
      icon: <FiTrendingUp size={24} />,
      color: 'bg-purple-500'
    },
    {
      title: 'Data Integrity',
      value: '100%',
      icon: <FiBarChart2 size={24} />,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Election Observer Dashboard</h1>
          <p className="text-gray-600">Monitor and analyze election results transparently</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
              <div className={`${stat.color} text-white p-3 rounded-lg w-fit mb-4`}>
                {stat.icon}
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Observable Elections */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Public Elections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => (
              <div key={election.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
                <div className={`h-2 ${
                  election.status === 'active' 
                    ? 'bg-green-500' 
                    : 'bg-blue-500'
                }`}></div>
                
                <div className="p-6">
                  {/* Election Title */}
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{election.title}</h3>
                  
                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      election.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                    </span>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-2 mb-4 pb-4 border-b">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Votes:</span>
                      <span className="font-semibold text-gray-800">{election.votes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Candidates:</span>
                      <span className="font-semibold text-gray-800">{election.candidates}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Voter Turnout:</span>
                      <span className="font-semibold text-green-600">{election.turnout}%</span>
                    </div>
                  </div>

                  {/* Leading Candidate */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Current Leader</p>
                    <p className="font-semibold text-gray-800">{election.leader}</p>
                    <p className="text-sm text-gray-600">{election.leaderVotes.toLocaleString()} votes</p>
                  </div>

                  {/* View Results Button */}
                  <Link 
                    to={`/observer/elections/${election.id}/analysis`}
                    className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition text-center"
                  >
                    View Analysis →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Information Box */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <h3 className="font-semibold text-blue-900 mb-2">Observer Role Information</h3>
          <p className="text-blue-800 text-sm">
            As an observer, you have read-only access to public election data. You can view real-time voting trends, candidate rankings, 
            voter turnout statistics, and integrity verification data to ensure transparency in the electoral process.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ObserverDashboard;
