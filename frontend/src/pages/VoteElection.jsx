import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { voterAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiRadio, FiInfo } from 'react-icons/fi';

const VoteElection = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [voteOtpVerified, setVoteOtpVerified] = useState(false);

  // fetchElectionDetails intentionally runs when `id` changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchElectionDetails();
  }, [id]);

  const fetchElectionDetails = async () => {
    try {
      setLoading(true);
      const response = await voterAPI.getElectionDetails(id);
      setElection(response.data.election);
      setCandidates(response.data.candidates);
      setHasVoted(response.data.has_voted);
    } catch (error) {
      toast.error('Failed to load election details');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }

    // Require OTP verification before casting vote
    if (!voteOtpVerified) {
      setOtpModalOpen(true);
      toast('Please verify OTP before casting your vote');
      return;
    }

    try {
      setLoading(true);
      await voterAPI.castVote({
        election_id: id,
        candidate_id: selectedCandidate
      });
      toast.success('Vote cast successfully!');
      setHasVoted(true);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cast vote');
    } finally {
      setLoading(false);
    }
  };

  const requestOTP = async () => {
    try {
      setRequestingOtp(true);
      await voterAPI.requestVoteOTP();
      setOtpSent(true);
      toast.success('OTP sent to your registered email');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setRequestingOtp(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpInput || otpInput.length !== 6) {
      toast.error('Enter a valid 6-digit OTP');
      return;
    }

    try {
      setVerifyingOtp(true);
      await voterAPI.verifyVoteOTP({ otp: otpInput });
      setVoteOtpVerified(true);
      setOtpModalOpen(false);
      toast.success('OTP verified. You can now cast your vote.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!election) {
    return <div className="flex items-center justify-center min-h-screen">Election not found</div>;
  }

  const canVote = new Date() >= new Date(election.start_date) &&
                  new Date() <= new Date(election.end_date) &&
                  election.status === 'active' &&
                  !hasVoted;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{election.title}</h1>
          <p className="text-gray-600 mb-6">{election.description}</p>

          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold text-gray-800 capitalize">{election.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Start</p>
              <p className="text-lg font-semibold text-gray-800">{new Date(election.start_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">End</p>
              <p className="text-lg font-semibold text-gray-800">{new Date(election.end_date).toLocaleDateString()}</p>
            </div>
          </div>

          {hasVoted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <FiInfo className="text-green-600 text-xl" />
              <p className="text-green-700 font-semibold">You have already voted in this election</p>
            </div>
          )}
        </div>

        {!hasVoted && !canVote && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <p className="text-orange-700 font-semibold">Voting is not available at this time</p>
          </div>
        )}

        {canVote && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Your Candidate</h2>

            <div className="space-y-4">
              {candidates.map((candidate) => (
                <label
                  key={candidate.id}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                    selectedCandidate === candidate.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="candidate"
                    checked={selectedCandidate === candidate.id}
                    onChange={() => setSelectedCandidate(candidate.id)}
                    className="w-5 h-5 text-blue-500"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{candidate.name}</h3>
                    <p className="text-sm text-gray-600">{candidate.party_name || 'Independent'}</p>
                    {candidate.description && (
                      <p className="text-sm text-gray-600 mt-1">{candidate.description}</p>
                    )}
                  </div>
                  {candidate.symbol && (
                    <span className="text-3xl ml-4">{candidate.symbol}</span>
                  )}
                </label>
              ))}
            </div>

            <button
              onClick={handleVote}
              disabled={loading || !selectedCandidate}
              className="w-full mt-8 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 text-lg flex items-center justify-center gap-2"
            >
              <FiRadio />
              {loading ? 'Casting Vote...' : 'Cast Vote'}
            </button>
          
            <div className="mt-4 text-center">
              {!voteOtpVerified && (
                <button
                  onClick={() => setOtpModalOpen(true)}
                  className="mt-3 text-sm text-blue-600 underline"
                >
                  Request / Verify OTP to Vote
                </button>
              )}
              {voteOtpVerified && (
                <p className="text-sm text-green-600 mt-3">OTP verified for voting</p>
              )}
            </div>
          </div>
        )}

        {/* OTP Modal */}
        {otpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Vote OTP Verification</h3>
              <p className="text-sm text-gray-600 mb-4">We will send a 6-digit OTP to your registered email. It expires in {process.env.REACT_APP_OTP_EXPIRE || 5} minutes.</p>

              {!otpSent ? (
                <div className="flex gap-2">
                  <button
                    onClick={requestOTP}
                    disabled={requestingOtp}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
                  >
                    {requestingOtp ? 'Sending...' : 'Request OTP'}
                  </button>
                  <button
                    onClick={() => setOtpModalOpen(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full border p-3 rounded-lg mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={verifyOTP}
                      disabled={verifyingOtp}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                    >
                      {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button
                      onClick={requestOTP}
                      disabled={requestingOtp}
                      className="flex-1 bg-blue-200 text-blue-800 py-2 rounded-lg"
                    >
                      Resend
                    </button>
                  </div>
                  <button
                    onClick={() => { setOtpModalOpen(false); setOtpSent(false); setOtpInput(''); }}
                    className="mt-3 w-full bg-gray-100 text-gray-800 py-2 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {candidates.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">All Candidates</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800">{candidate.name}</h4>
                  <p className="text-sm text-gray-600">{candidate.party_name || 'Independent'}</p>
                  {candidate.symbol && <p className="text-2xl mt-2">{candidate.symbol}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoteElection;
