import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiKey, FiRefreshCw } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Email not found. Please register again.');
      navigate('/register');
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/otp/verify`, {
        email,
        otp
      });

      if (response.data.success) {
        toast.success('OTP verified successfully!');
        // Store user info
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/cast-vote', { state: { user: response.data.user } });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error('Email not found');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/otp/resend`, { email });
      
      if (response.data.success) {
        toast.success('New OTP sent successfully!');
        // Show OTP in console for testing (remove in production)
        console.log('New OTP:', response.data.otp);
        toast.success(`Your OTP: ${response.data.otp}`, { duration: 10000 });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiKey className="text-blue-600 text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Verify OTP</h2>
          <p className="text-gray-600 mt-2">
            Enter the 6-digit OTP sent to
          </p>
          <p className="text-blue-600 font-semibold">{email}</p>
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              maxLength={6}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-center text-2xl font-mono font-bold tracking-widest outline-none focus:border-blue-500"
              disabled={loading}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            type="button"
            onClick={handleResendOTP}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-500 py-3 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50"
          >
            <FiRefreshCw />
            Resend OTP
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Back to Registration
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> For testing purposes, the OTP will be displayed in a toast notification.
            In production, it should be sent via email/SMS.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
