import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiUser, FiAward } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CastVote = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || JSON.parse(localStorage.getItem('user') || 'null');

  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Please login first');
      navigate('/register');
      return;
    }
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      fetchCandidates(selectedElection);
      checkVoteStatus(selectedElection);
    }
  }, [selectedElection]);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/elections`);
      
      // Filter only active elections
      const activeElections = response.data.elections.filter(
        election => election.status === 'active'
      );
      
      setElections(activeElections);
      
      if (activeElections.length > 0) {
        setSelectedElection(activeElections[0].id);
      } else {
        toast.error('No active elections available');
      }
    } catch (error) {
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async (electionId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/vote/candidates/${electionId}`);
      
      if (response.data.success) {
        setCandidates(response.data.candidates);
      }
    } catch (error) {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const checkVoteStatus = async (electionId) => {
    try {
      const response = await axios.get(`${API_URL}/vote/status/${electionId}/${user.id}`);
      setHasVoted(response.data.hasVoted);
      
      if (response.data.hasVoted) {
        toast.error('You have already voted in this election');
      }
    } catch (error) {
      console.error('Failed to check vote status');
    }
  };

  const handleCastVote = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }

    if (hasVoted) {
      toast.error('You have already voted in this election');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/vote/cast`, {
        electionId: selectedElection,
        candidateId: selectedCandidate,
        userId: user.id
      });

      if (response.data.success) {
        toast.success('Vote cast successfully!');
        setHasVoted(true);
        
        // Show success message for 3 seconds then redirect
        setTimeout(() => {
          navigate('/vote-success', { 
            state: { 
              candidateName: response.data.vote.candidate_name 
            } 
          });
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cast vote');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Cast Your Vote</h1>
              <p className="text-gray-600 mt-1">Welcome, {user.name}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <FiUser className="text-blue-600 text-3xl" />
            </div>
          </div>
        </div>

        {/* Election Selection */}
        {elections.length > 1 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              Select Election
            </label>
            <select
              value={selectedElection || ''}
              onChange={(e) => setSelectedElection(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
              disabled={loading}
            >
              {elections.map((election) => (
                <option key={election.id} value={election.id}>
                  {election.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Vote Status Warning */}
        {hasVoted && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <FiCheckCircle className="text-yellow-500 text-xl mr-3" />
              <p className="text-yellow-800 font-semibold">
                You have already voted in this election
              </p>
            </div>
          </div>
        )}

        {/* Candidates List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Select a Candidate</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading candidates...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No candidates available</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => !hasVoted && setSelectedCandidate(candidate.id)}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                    selectedCandidate === candidate.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  } ${hasVoted ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <FiAward className="text-purple-600 text-2xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{candidate.name}</h3>
                      {candidate.party_name && (
                        <p className="text-gray-600 text-sm mt-1">{candidate.party_name}</p>
                      )}
                      {candidate.position && (
                        <p className="text-gray-500 text-sm">{candidate.position}</p>
                      )}
                      {candidate.description && (
                        <p className="text-gray-600 text-sm mt-2">{candidate.description}</p>
                      )}
                      {candidate.symbol && (
                        <p className="text-blue-600 text-sm mt-2 font-semibold">
                          Symbol: {candidate.symbol}
                        </p>
                      )}
                    </div>
                    {selectedCandidate === candidate.id && (
                      <FiCheckCircle className="text-blue-500 text-2xl" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          {candidates.length > 0 && (
            <div className="mt-8">
              <button
                onClick={handleCastVote}
                disabled={loading || !selectedCandidate || hasVoted}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : hasVoted ? 'Already Voted' : 'Cast Vote'}
              </button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Important:</strong> You can only vote once per election. 
            Please review your selection carefully before submitting.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CastVote;
