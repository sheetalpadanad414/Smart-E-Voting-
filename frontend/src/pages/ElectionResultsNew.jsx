import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { FiDownload, FiArrowLeft, FiAward, FiTrendingUp, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const ElectionResultsNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const results = {
    title: 'Class President Election 2024',
    status: 'Completed',
    endDate: '2024-02-20',
    totalVotes: 245,
    uniqueVoters: 280,
    turnout: 87.5,
    candidates: [
      { id: 1, name: 'Alice Johnson', symbol: '📘', votes: 98, party: 'Progressive Students' },
      { id: 2, name: 'Bob Smith', symbol: '🤝', votes: 87, party: 'Student Unity' },
      { id: 3, name: 'Carol Davis', symbol: '🚀', votes: 42, party: 'Future Leaders' },
      { id: 4, name: 'David Wilson', symbol: '💚', votes: 18, party: 'Community First' }
    ]
  };

  // Find winner
  const winner = results.candidates.reduce((prev, current) => 
    (prev.votes > current.votes) ? prev : current
  );

  // Chart Data
  const barChartData = {
    labels: results.candidates.map(c => c.name),
    datasets: [{
      label: 'Votes Received',
      data: results.candidates.map(c => c.votes),
      backgroundColor: [
        '#3B82F6',
        '#10B981',
        '#F59E0B',
        '#EF4444'
      ],
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const pieChartData = {
    labels: results.candidates.map(c => c.name),
    datasets: [{
      data: results.candidates.map(c => c.votes),
      backgroundColor: [
        '#3B82F6',
        '#10B981',
        '#F59E0B',
        '#EF4444'
      ],
      borderColor: '#fff',
      borderWidth: 2,
    }]
  };

  const handleExportPDF = async () => {
    toast.success('Exporting PDF... Download will start soon');
    // Mock PDF export
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/elections')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-8 font-semibold"
        >
          <FiArrowLeft />
          <span>Back to Elections</span>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{results.title}</h1>
          <p className="text-green-100 text-lg mb-4">Results are now available</p>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8">
            <div>
              <span className="text-green-100">Status: </span>
              <span className="font-semibold">{results.status}</span>
            </div>
            <div>
              <span className="text-green-100">Completed: </span>
              <span className="font-semibold">{results.endDate}</span>
            </div>
          </div>
        </div>

        {/* Winner Card */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <FiAward size={32} className="animate-bounce" />
            <div>
              <p className="text-yellow-100 text-sm font-semibold">🎉 ELECTION WINNER 🎉</p>
              <h2 className="text-3xl font-bold">{winner.name}</h2>
            </div>
          </div>
          <p className="text-yellow-100">From the party <span className="font-bold">{winner.party}</span></p>
          <p className="text-3xl font-bold mt-4">{winner.votes} votes ({((winner.votes / results.totalVotes) * 100).toFixed(1)}%)</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Votes</p>
                <p className="text-3xl font-bold text-gray-900">{results.totalVotes}</p>
              </div>
              <FiTrendingUp className="text-blue-600 opacity-20" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Unique Voters</p>
                <p className="text-3xl font-bold text-gray-900">{results.uniqueVoters}</p>
              </div>
              <FiUsers className="text-green-600 opacity-20" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Voter Turnout</p>
                <p className="text-3xl font-bold text-gray-900">{results.turnout}%</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                {results.turnout}%
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Vote Distribution</h3>
            <div className="relative h-80">
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Vote Percentage</h3>
            <div className="relative h-80">
              <Pie
                data={pieChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Detailed Results Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900">Detailed Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Candidate</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Party</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Votes</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {results.candidates
                  .sort((a, b) => b.votes - a.votes)
                  .map((candidate, index) => (
                    <tr key={candidate.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{candidate.symbol}</span>
                          <span className="font-semibold text-gray-900">{candidate.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{candidate.party}</td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="font-bold text-gray-900">{candidate.votes}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="font-semibold text-blue-600">
                          {((candidate.votes / results.totalVotes) * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-center">
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold shadow-lg"
          >
            <FiDownload size={20} />
            <span>Download Results as PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ElectionResultsNew;
