import React from 'react';
import { useParams } from 'react-router-dom';
import { FiDownload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ObserverAnalysis = () => {
  const { electionId } = useParams();

  const mockElection = {
    id: electionId || '1',
    title: 'Municipal Elections 2024',
    totalVotes: 8234,
    uniqueVoters: 8234,
    totalCandidates: 12,
    votingPercentage: 72,
    startDate: '2024-02-15',
    endDate: '2024-02-20'
  };

  const mockCandidates = [
    { id: 1, name: 'Candidate A', party: 'Party XYZ', votes: 3200, percentage: 38.8 },
    { id: 2, name: 'Candidate B', party: 'Party ABC', votes: 2800, percentage: 34.0 },
    { id: 3, name: 'Candidate C', party: 'Party DEF', votes: 1500, percentage: 18.2 },
    { id: 4, name: 'Candidate D', party: 'Party GHI', votes: 734, percentage: 8.9 }
  ];

  const mockTrendData = [
    { time: '8 AM', votes: 145 },
    { time: '10 AM', votes: 401 },
    { time: '12 PM', votes: 790 },
    { time: '2 PM', votes: 1268 },
    { time: '4 PM', votes: 1746 },
    { time: '6 PM', votes: 2500 }
  ];

  const mockIntegrity = {
    totalVotes: mockElection.totalVotes,
    validVotes: 8234,
    invalidVotes: 0,
    allVotesMatched: true,
    dataConsistency: '100%'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{mockElection.title}</h1>
            <p className="text-gray-600">Analysis & Transparency Report</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <FiDownload size={18} />
            <span>Export Report</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Votes</p>
            <p className="text-2xl font-bold text-gray-800">{mockElection.totalVotes.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Unique Voters</p>
            <p className="text-2xl font-bold text-gray-800">{mockElection.uniqueVoters.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Candidates</p>
            <p className="text-2xl font-bold text-gray-800">{mockElection.totalCandidates}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Voter Participation</p>
            <p className="text-2xl font-bold text-green-600">{mockElection.votingPercentage}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vote Distribution */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Vote Distribution by Candidate</h2>
            
            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockCandidates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="votes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>

            {/* Candidate List */}
            <div className="mt-6 space-y-3">
              {mockCandidates.map((candidate, index) => (
                <div key={candidate.id}>
                  <div className="flex justify-between mb-1">
                    <div>
                      <p className="font-semibold text-gray-800">#{index + 1} {candidate.name}</p>
                      <p className="text-sm text-gray-500">{candidate.party}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{candidate.votes.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{candidate.percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${candidate.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vote Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Vote Share</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={mockCandidates}
                  dataKey="votes"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {mockCandidates.map((candidate, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Voting Trend */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Voting Trend Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="votes" stroke="#3b82f6" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Integrity Verification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Data Integrity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <FiCheckCircle className="text-green-600" />
              <span>Data Integrity Verification</span>
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Total Votes:</span>
                <span className="font-semibold">{mockIntegrity.totalVotes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Valid Votes:</span>
                <span className="font-semibold text-green-600">{mockIntegrity.validVotes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Invalid Votes:</span>
                <span className="font-semibold text-red-600">{mockIntegrity.invalidVotes}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">All Votes Matched:</span>
                <span className={`font-semibold ${mockIntegrity.allVotesMatched ? 'text-green-600' : 'text-red-600'}`}>
                  {mockIntegrity.allVotesMatched ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Data Consistency:</span>
                <span className="font-semibold text-green-600">{mockIntegrity.dataConsistency}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                ✓ All integrity checks passed. Data is consistent and verified.
              </p>
            </div>
          </div>

          {/* Analysis Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <FiAlertCircle className="text-blue-600" />
              <span>Analysis Summary</span>
            </h2>
            
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <p className="font-semibold text-blue-900">Victory Margin</p>
                <p className="text-blue-800">Candidate A leading by 400 votes (4.8%)</p>
              </div>
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <p className="font-semibold text-green-900">Voter Participation</p>
                <p className="text-green-800">72% turnout exceeds national average</p>
              </div>
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                <p className="font-semibold text-purple-900">Vote Distribution</p>
                <p className="text-purple-800">Top 2 candidates account for 72.8% of votes</p>
              </div>
              <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                <p className="font-semibold text-orange-900">Peak Hours</p>
                <p className="text-orange-800">Highest voting activity 2-4 PM (890 votes)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transparency Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Transparency & Data Verification</h3>
          <p className="text-blue-800 text-sm">
            This report contains publicly verified election data. All vote counts, candidate rankings, and statistical analyses have been 
            independently verified for accuracy and integrity. As an observer, you have complete access to all public election information 
            to ensure transparency in the electoral process.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ObserverAnalysis;
