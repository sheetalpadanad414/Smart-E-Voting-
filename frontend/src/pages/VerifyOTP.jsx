import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, faceAPI } from '../services/api';
import useAuthStore from '../contexts/authStore';
import toast from 'react-hot-toast';
import { FiKey, FiRefreshCw } from 'react-icons/fi';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const email = location.state?.email || '';
  const isLoginFlow = location.state?.isLoginFlow || false;
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Email not found. Please login again.');
      navigate('/login');
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.verifyOTP({
        email,
        otp
      });

      if (response.data.success) {
        // Store auth data
        login(response.data.user, response.data.token);
        toast.success('OTP verified successfully!');
        
        // For login flow with voters, check if face is registered
        if (isLoginFlow && response.data.user.role === 'voter') {
          try {
            const faceStatus = await faceAPI.getFaceStatus();
            if (faceStatus.data.data.registered) {
              // Face registered, redirect to face verification
              navigate('/face-verification');
            } else {
              // No face registered, go directly to elections
              toast('Face not registered. You can register it from your profile.');
              navigate('/elections');
            }
          } catch (error) {
            // If face status check fails, go to elections
            navigate('/elections');
          }
        } else {
          // Non-voters or registration flow
          const redirectPath = response.data.user.role === 'admin' ? '/admin/dashboard' : '/elections';
          navigate(redirectPath);
        }
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
      const response = await authAPI.resendOTP({ email });
      
      // Auto-populate OTP in development mode
      if (response.data.developmentOTP) {
        setOtp(response.data.developmentOTP);
        toast.success(`Development OTP: ${response.data.developmentOTP}`);
        console.log('🔐 Auto-filled development OTP:', response.data.developmentOTP);
      } else {
        toast.success('New OTP sent successfully!');
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
              onClick={() => navigate(isLoginFlow ? '/login' : '/register')}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Back to {isLoginFlow ? 'Login' : 'Registration'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> For testing purposes, the OTP will be displayed in a toast notification.
            In production, it should be sent via email/SMS.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
