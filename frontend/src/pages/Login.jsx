import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../contexts/authStore';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('login'); // 'login' or 'otp'
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const otpInputRef = useRef(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Web OTP API - Auto-fill OTP from SMS/Email
  useEffect(() => {
    if (step === 'otp' && 'OTPCredential' in window) {
      const abortController = new AbortController();
      
      navigator.credentials.get({
        otp: { transport: ['sms'] },
        signal: abortController.signal
      })
      .then(otp => {
        if (otp && otp.code) {
          setOtp(otp.code);
          if (otp.code.length === 6) {
            handleVerifyOTP({ preventDefault: () => {} }, otp.code);
          }
        }
      })
      .catch(err => {
        console.log('OTP auto-fill not available:', err);
      });

      return () => {
        abortController.abort();
      };
    }
  }, [step]);

  useEffect(() => {
    if (step === 'otp' && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      
      // Check if it's admin login (admin@evoting.com or contains 'admin')
      const isAdmin = formData.email.includes('admin');
      
      if (isAdmin) {
        // Direct admin login without OTP
        const response = await authAPI.adminLogin(formData);
        login(response.data.user, response.data.token);
        toast.success('Admin login successful');
        navigate('/admin/dashboard');
      } else {
        // Regular user login - requires OTP
        const response = await authAPI.login(formData);
        setEmail(formData.email);
        setStep('otp');
        toast.success('OTP sent to your email');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e, otpCode = null) => {
    e.preventDefault();
    const otpToVerify = otpCode || otp;
    
    if (!otpToVerify || otpToVerify.length !== 6) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.verifyOTP({ email, otp: otpToVerify });
      login(response.data.user, response.data.token);
      toast.success('Login successful');
      
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/elections');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    
    if (value.length === 6) {
      setTimeout(() => {
        handleVerifyOTP({ preventDefault: () => {} }, value);
      }, 300);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      await authAPI.login(formData);
      toast.success('OTP resent successfully');
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Smart E-Voting</h2>
        <p className="text-gray-600 mb-6">
          {step === 'login' ? 'Sign in to your account' : 'Enter verification code'}
        </p>

        {step === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <FiMail className="text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="flex-1 ml-2 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <FiLock className="text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Your password"
                  className="flex-1 ml-2 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-500 hover:underline font-semibold">
                Register
              </a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <p className="text-center text-gray-600 mb-4">
              An OTP has been sent to <strong>{email}</strong>
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                maxLength={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl font-mono font-bold tracking-widest outline-none focus:border-blue-500"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                OTP will auto-fill from email if supported
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className="w-full border border-blue-500 text-blue-500 py-2 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50"
            >
              Resend OTP
            </button>

            <button
              type="button"
              onClick={() => { setStep('login'); setOtp(''); }}
              className="w-full text-gray-600 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
