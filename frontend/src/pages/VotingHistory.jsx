import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { voterAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiCalendar, FiUser, FiFileText } from 'react-icons/fi';

const VotingHistory = () => {
  const navigate = useNavigate();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchVotingHistory();
  }, [pagination.current_page]);

  const fetchVotingHistory = async () => {
    try {
      setLoading(true);
      const response = await voterAPI.getVotingHistory(pagination.current_page);
      setVotes(response.data.votes);
      setPagination({
        current_page: response.data.current_page,
        total: response.data.total,
        pages: response.data.pages
      });
    } catch (error) {
      toast.error('Failed to load voting history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading voting history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Voting History</h1>
              <p className="text-gray-600">View all elections you have participated in</p>
            </div>
            <button
              onClick={() => navigate('/elections')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              Browse Elections
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Votes Cast</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{pagination.total}</p>
              </div>
              <FiCheckCircle className="text-blue-500 text-4xl" />
            </div>
          </div>
        </div>

        {/* Voting History */}
        {votes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiFileText className="text-gray-400 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Voting History</h2>
            <p className="text-gray-600 mb-6">You haven't cast any votes yet.</p>
            <button
              onClick={() => navigate('/elections')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              View Available Elections
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Election
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Candidate
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Date Voted
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {votes.map((vote) => (
                      <tr key={vote.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <FiFileText className="text-blue-500 text-xl" />
                            <span className="font-semibold text-gray-800">
                              {vote.election_title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FiUser className="text-gray-400" />
                            <span className="text-gray-700">{vote.candidate_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <FiCalendar className="text-gray-400" />
                            <span>{new Date(vote.voted_at).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1 w-fit">
                            <FiCheckCircle />
                            Confirmed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                  disabled={pagination.current_page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {pagination.current_page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                  disabled={pagination.current_page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VotingHistory;
