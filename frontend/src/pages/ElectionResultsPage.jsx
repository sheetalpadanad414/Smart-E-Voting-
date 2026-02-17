import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { voterAPI } from '../services/api';
import useAuthStore from '../contexts/authStore';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  FiTrendingUp, FiPieChart, FiBarChart2, FiUsers, 
  FiCheckCircle, FiAlertCircle, FiLogOut, FiHome 
} from 'react-icons/fi';

const ElectionResultsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await voterAPI.getAvailableElections(1, 100);
      setElections(response.data.elections);
      
      // Auto-select first completed election
      const completedElection = response.data.elections.find(e => e.status === 'completed');
      if (completedElection) {
        setSelectedElection(completedElection.id);
        fetchResults(completedElection.id);
      }
    } catch (error) {
      console.error('Error fetching elections:', error);
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (electionId) => {
    try {
      setLoadingResults(true);
      const response = await voterAPI.getElectionResults(electionId);
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
      if (error.response?.status === 400) {
        toast.error('Results are not yet available for this election');
        setResults(null);
      } else {
        toast.error('Failed to load results');
      }
    } finally {
      setLoadingResults(false);
    }
  };

  const handleElectionChange = (electionId) => {
    setSelectedElection(electionId);
    if (electionId) {
      fetchResults(electionId);
    } else {
      setResults(null);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getChartData = () => {
    if (!results || !results.results) return [];
    
    return results.results.candidates.map(candidate => ({
      name: candidate.name,
      votes: parseInt(candidate.vote_count) || 0,
      percentage: results.results.total_votes > 0 
        ? ((parseInt(candidate.vote_count) / results.results.total_votes) * 100).toFixed(2)
        : 0
    }));
  };

  const getWinner = () => {
    if (!results || !results.results || !results.results.candidates.length) return null;
    
    return results.results.candidates.reduce((prev, current) => 
      (parseInt(current.vote_count) > parseInt(prev.vote_count)) ? current : prev
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading elections...</p>
        </div>
      </div>
    );
  }

  const selectedElectionData = elections.find(e => e.id === selectedElection);
  const chartData = getChartData();
  const winner = getWinner();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FiTrendingUp className="text-blue-500 text-4xl" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Election Results</h1>
                <p className="text-gray-600">View detailed voting results and statistics</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/elections')}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition font-semibold"
              >
                <FiHome />
                Elections
              </button>
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold"
                >
                  <FiLogOut />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Election Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Election
          </label>
          <select
            value={selectedElection || ''}
            onChange={(e) => handleElectionChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          >
            <option value="">-- Select an election --</option>
            {elections.map((election) => (
              <option key={election.id} value={election.id}>
                {election.title} - {election.status === 'completed' ? '✓ Completed' : election.status}
              </option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {loadingResults && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading results...</p>
          </div>
        )}

        {/* No Election Selected */}
        {!selectedElection && !loadingResults && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiPieChart className="text-gray-400 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Election Selected</h2>
            <p className="text-gray-600">Please select an election from the dropdown above to view results</p>
          </div>
        )}

        {/* Results Not Available */}
        {selectedElection && !loadingResults && !results && selectedElectionData && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiAlertCircle className="text-yellow-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Results Not Available Yet</h2>
            <p className="text-gray-600 mb-4">
              Results will be available after the election ends
            </p>
            <div className="bg-blue-50 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Election Status:</span> {selectedElectionData.status}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-semibold">End Date:</span> {new Date(selectedElectionData.end_date).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Results Display */}
        {selectedElection && !loadingResults && results && (
          <>
            {/* Election Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{results.election.title}</h2>
              <p className="text-gray-600 mb-4">{results.election.description}</p>
              
              <div className="grid gap-4 md:grid-cols-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FiUsers className="text-blue-500 text-2xl" />
                    <div>
                      <p className="text-sm text-gray-600">Total Voters</p>
                      <p className="text-2xl font-bold text-blue-600">{results.results.total_voters}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="text-green-500 text-2xl" />
                    <div>
                      <p className="text-sm text-gray-600">Total Votes</p>
                      <p className="text-2xl font-bold text-green-600">{results.results.total_votes}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FiTrendingUp className="text-purple-500 text-2xl" />
                    <div>
                      <p className="text-sm text-gray-600">Turnout</p>
                      <p className="text-2xl font-bold text-purple-600">{results.results.turnout}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FiUsers className="text-orange-500 text-2xl" />
                    <div>
                      <p className="text-sm text-gray-600">Candidates</p>
                      <p className="text-2xl font-bold text-orange-600">{results.results.candidates.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Winner Announcement */}
            {winner && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="bg-white rounded-full p-4">
                    <FiCheckCircle className="text-green-500 text-4xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Winner</h3>
                    <p className="text-3xl font-bold mt-1">{winner.name}</p>
                    <p className="text-lg mt-1">
                      {winner.vote_count} votes ({((parseInt(winner.vote_count) / results.results.total_votes) * 100).toFixed(2)}%)
                    </p>
                    {winner.party_name && (
                      <p className="text-sm mt-1 opacity-90">{winner.party_name}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2 mb-6">
              {/* Bar Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FiBarChart2 className="text-blue-500 text-2xl" />
                  <h3 className="text-xl font-bold text-gray-800">Vote Distribution</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="votes" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FiPieChart className="text-blue-500 text-2xl" />
                  <h3 className="text-xl font-bold text-gray-800">Vote Percentage</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="votes"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Results Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800">Detailed Results</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rank</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Candidate</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Party</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Position</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Votes</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {results.results.candidates.map((candidate, index) => {
                      const percentage = results.results.total_votes > 0
                        ? ((parseInt(candidate.vote_count) / results.results.total_votes) * 100).toFixed(2)
                        : 0;
                      
                      return (
                        <tr key={candidate.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {index === 0 && <FiCheckCircle className="text-green-500" />}
                              <span className="font-semibold text-gray-800">{candidate.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{candidate.party_name || '-'}</td>
                          <td className="px-6 py-4 text-gray-600">{candidate.position || '-'}</td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-semibold text-gray-800">{candidate.vote_count}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="font-semibold text-gray-800 w-16 text-right">
                                {percentage}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ElectionResultsPage;
