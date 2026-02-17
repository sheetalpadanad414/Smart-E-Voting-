import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { voterAPI } from '../services/api';
import useAuthStore from '../contexts/authStore';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiAlertCircle, FiClock, FiUser, FiAward, FiLogOut } from 'react-icons/fi';

const CastVote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      toast.error('Please login to vote');
      navigate('/login');
      return;
    }
    fetchElectionDetails();
  }, [id, user, navigate]);

  const fetchElectionDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching election details for ID:', id);
      const response = await voterAPI.getElectionDetails(id);
      console.log('Election details response:', response.data);
      setElection(response.data.election);
      setCandidates(response.data.candidates);
      setHasVoted(response.data.has_voted);
    } catch (error) {
      console.error('Error fetching election details:', error);
      toast.error(error.response?.data?.error || 'Failed to load election details');
      setTimeout(() => navigate('/elections'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSubmit = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Submitting vote:', { election_id: id, candidate_id: selectedCandidate });
      const response = await voterAPI.castVote({
        election_id: id,
        candidate_id: selectedCandidate
      });
      
      toast.success(response.data.message || 'Vote cast successfully!');
      
      // Redirect to results page after 2 seconds
      setTimeout(() => {
        navigate('/results');
      }, 2000);
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error(error.response?.data?.error || 'Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading election details...</p>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Election Not Found</h2>
          <button
            onClick={() => navigate('/elections')}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Back to Elections
          </button>
        </div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <FiCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Already Voted</h2>
          <p className="text-gray-600 mb-6">
            You have already cast your vote in this election.
          </p>
          <button
            onClick={() => navigate('/voter/history')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            View Voting History
          </button>
        </div>
      </div>
    );
  }

  if (election.status !== 'active') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <FiAlertCircle className="text-yellow-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Election Not Active</h2>
          <p className="text-gray-600 mb-6">
            This election is currently {election.status}. Voting is only allowed during active elections.
          </p>
          <button
            onClick={() => navigate('/elections')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            Back to Elections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{election.title}</h1>
              <p className="text-gray-600 mb-4">{election.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <FiClock className="text-blue-500" />
                  <span>
                    {new Date(election.start_date).toLocaleDateString()} - {new Date(election.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                    Active
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <FiUser className="text-blue-500 text-2xl mx-auto mb-2" />
                <p className="text-sm text-gray-600">Voting as</p>
                <p className="font-semibold text-gray-800">{user?.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold text-sm"
              >
                <FiLogOut />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <div className="flex items-start">
            <FiAlertCircle className="text-blue-500 text-xl mr-3 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Voting Instructions</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Select one candidate by clicking on their card</li>
                <li>• Review your selection carefully before submitting</li>
                <li>• Once submitted, your vote cannot be changed</li>
                <li>• You can only vote once in this election</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Candidates */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiAward className="text-blue-500" />
            Select Your Candidate
          </h2>
          
          {candidates.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No candidates available for this election.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate.id)}
                  className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all transform hover:scale-105 ${
                    selectedCandidate === candidate.id
                      ? 'ring-4 ring-blue-500 shadow-xl'
                      : 'hover:shadow-lg'
                  }`}
                >
                  {/* Candidate Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
                    {candidate.image_url ? (
                      <img
                        src={candidate.image_url}
                        alt={candidate.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiUser className="text-white text-6xl" />
                      </div>
                    )}
                    
                    {/* Selection Indicator */}
                    {selectedCandidate === candidate.id && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-2">
                        <FiCheckCircle className="text-2xl" />
                      </div>
                    )}
                  </div>

                  {/* Candidate Info */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{candidate.name}</h3>
                    
                    {candidate.party_name && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold">Party:</span> {candidate.party_name}
                      </p>
                    )}
                    
                    {candidate.position && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold">Position:</span> {candidate.position}
                      </p>
                    )}
                    
                    {candidate.symbol && (
                      <p className="text-sm text-gray-600 mb-3">
                        <span className="font-semibold">Symbol:</span> {candidate.symbol}
                      </p>
                    )}
                    
                    {candidate.description && (
                      <p className="text-sm text-gray-700 line-clamp-3">{candidate.description}</p>
                    )}
                  </div>

                  {/* Radio Button */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-center">
                      <input
                        type="radio"
                        name="candidate"
                        checked={selectedCandidate === candidate.id}
                        onChange={() => setSelectedCandidate(candidate.id)}
                        className="w-5 h-5 text-blue-500 cursor-pointer"
                      />
                      <label className="ml-2 text-sm font-semibold text-gray-700 cursor-pointer">
                        {selectedCandidate === candidate.id ? 'Selected' : 'Select this candidate'}
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        {candidates.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Ready to submit your vote?</h3>
                <p className="text-sm text-gray-600">
                  {selectedCandidate
                    ? `You have selected: ${candidates.find(c => c.id === selectedCandidate)?.name}`
                    : 'Please select a candidate above'}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/elections')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVoteSubmit}
                  disabled={!selectedCandidate || submitting}
                  className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />
                      Submit Vote
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CastVote;
