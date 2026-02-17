import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiHome } from 'react-icons/fi';

const VoteSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const candidateName = location.state?.candidateName || 'your selected candidate';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 text-center">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle className="text-green-600 text-5xl" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Vote Cast Successfully!
        </h1>

        <p className="text-gray-600 mb-2">
          Your vote has been recorded for
        </p>
        <p className="text-xl font-bold text-blue-600 mb-6">
          {candidateName}
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Thank you for participating in the democratic process. 
            Your vote has been securely recorded and cannot be changed.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
          >
            <FiHome />
            Back to Home
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoteSuccess;
