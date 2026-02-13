import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle, FiArrowLeft, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const VoteElectionNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  const election = {
    id: id,
    title: 'Class President Election 2024',
    description: 'Vote for the next class president to lead and represent our class.',
    status: 'active',
    startDate: '2024-02-15',
    endDate: '2024-02-20',
    candidates: [
      {
        id: 1,
        name: 'Alice Johnson',
        party: 'Progressive Students',
        symbol: '📘',
        description: 'Experienced leader with focus on academic excellence',
        bio: 'Third year student with strong academic record and leadership experience'
      },
      {
        id: 2,
        name: 'Bob Smith',
        party: 'Student Unity',
        symbol: '🤝',
        description: 'Dedicated to improving student welfare and campus life',
        bio: 'Active in student activities and known for collaborative approach'
      },
      {
        id: 3,
        name: 'Carol Davis',
        party: 'Future Leaders',
        symbol: '🚀',
        description: 'Innovative ideas for student development and innovation',
        bio: 'Entrepreneurial minded with vision for transformative changes'
      },
      {
        id: 4,
        name: 'David Wilson',
        party: 'Community First',
        symbol: '💚',
        description: 'Focused on student welfare and community engagement',
        bio: 'Volunteer leader committed to student welfare programs'
      }
    ]
  };

  const handleVote = async () => {
    if (hasVoted) {
      toast.error('You have already voted in this election');
      return;
    }

    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Your vote has been recorded successfully!');
      setHasVoted(true);
      setShowConfirm(false);
      setTimeout(() => navigate(`/results/${id}`), 1500);
    } catch (error) {
      toast.error('Failed to record vote');
    } finally {
      setLoading(false);
    }
  };

  const selectedCandidateData = election.candidates.find(c => c.id === selectedCandidate);

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

        {/* Election Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{election.title}</h1>
          <p className="text-blue-100 text-lg mb-4">{election.description}</p>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8 text-sm md:text-base">
            <div>
              <span className="text-blue-100">From: </span>
              <span className="font-semibold">{election.startDate}</span>
            </div>
            <div>
              <span className="text-blue-100">To: </span>
              <span className="font-semibold">{election.endDate}</span>
            </div>
            <div>
              <span className="text-blue-100">Candidates: </span>
              <span className="font-semibold">{election.candidates.length}</span>
            </div>
          </div>
        </div>

        {/* Voting Status */}
        {hasVoted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-start space-x-3">
            <FiCheckCircle className="text-green-600 mt-1 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-green-900">Vote Recorded Successfully</h3>
              <p className="text-green-700 text-sm mt-1">Your vote has been securely recorded and cannot be changed.</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Candidates List */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Your Candidate</h2>
              <p className="text-gray-600">Choose one candidate to vote for. Your vote is confidential and secure.</p>
            </div>

            <div className="space-y-4">
              {election.candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => !hasVoted && setSelectedCandidate(candidate.id)}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition transform hover:scale-102 ${
                    selectedCandidate === candidate.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${hasVoted ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{candidate.symbol}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                        {selectedCandidate === candidate.id && (
                          <FiCheckCircle className="text-blue-600" size={20} />
                        )}
                      </div>
                      <p className="text-sm text-blue-600 font-semibold mb-2">{candidate.party}</p>
                      <p className="text-gray-600 text-sm mb-2">{candidate.bio}</p>
                      <p className="text-gray-500 text-xs italic">{candidate.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Candidate Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              {selectedCandidate ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 flex items-center justify-center h-32">
                    <span className="text-5xl">{selectedCandidateData?.symbol}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedCandidateData?.name}</h3>
                    <p className="text-blue-600 font-semibold text-sm mb-4">{selectedCandidateData?.party}</p>
                    <p className="text-gray-600 text-sm mb-6">{selectedCandidateData?.description}</p>
                    
                    <button
                      onClick={() => setShowConfirm(true)}
                      disabled={hasVoted || loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                    >
                      {loading ? 'Recording Vote...' : hasVoted ? 'Already Voted' : 'Confirm Vote'}
                    </button>

                    {/* Security Info */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-start space-x-2 text-xs text-gray-600">
                        <FiLock className="text-gray-400 flex-shrink-0 mt-0.5" />
                        <p>Your vote is confidential and encrypted. Only aggregate results will be public.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
                  <FiAlertCircle className="text-gray-400 mx-auto mb-3" size={32} />
                  <p className="text-gray-600 font-semibold">No candidate selected</p>
                  <p className="text-gray-500 text-sm mt-1">Select a candidate from the list to vote</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Your Vote</h2>
              <p className="text-gray-600 mb-4">
                You are about to vote for:
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-lg font-bold text-gray-900">{selectedCandidateData?.name}</p>
                <p className="text-blue-600 text-sm">{selectedCandidateData?.party}</p>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                This action cannot be undone. Your vote will be recorded securely.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVote}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm Vote'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoteElectionNew;
