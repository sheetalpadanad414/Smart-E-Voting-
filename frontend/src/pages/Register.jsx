import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../contexts/authStore';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiBriefcase } from 'react-icons/fi';
import LocationDropdown from '../components/LocationDropdown';
import FaceCapture from '../components/FaceCapture';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [step, setStep] = useState('register'); // register, otp, face
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'voter',
    country_id: null,
    state_id: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate role-specific fields
    if ((formData.role === 'election_officer' || formData.role === 'observer') && 
        (!formData.department || !formData.designation)) {
      toast.error('Please fill department and designation for this role');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        department: formData.department || null,
        designation: formData.designation || null,
        assignment_area: formData.assignment_area || null,
        country_id: formData.country_id || null,
        state_id: formData.state_id || null
      });
      
      setEmail(formData.email);
      setStep('otp');
      
      // Auto-populate OTP in development mode
      if (response.data.developmentOTP) {
        setOtp(response.data.developmentOTP);
        toast.success(`Development OTP: ${response.data.developmentOTP}`);
        console.log('🔐 Auto-filled development OTP:', response.data.developmentOTP);
      } else {
        toast.success('Registration successful! Please verify OTP');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error('Please enter OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.verifyOTP({
        email,
        otp
      });
      
      // Store token and user
      login(response.data.user, response.data.token);
      toast.success('Email verified successfully');
      
      // Move to face registration step
      setStep('face');
      
    } catch (error) {
      toast.error(error.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceCapture = async (descriptor) => {
    try {
      setLoading(true);
      console.log('📤 Sending face descriptor to backend...');
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/face/store-descriptor',
        { descriptor },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('✅ Face registered:', response.data);
      toast.success('Face registered successfully!');
      
      // Navigate to elections
      navigate('/elections');
      
    } catch (error) {
      console.error('❌ Face registration error:', error);
      toast.error('Failed to register face. You can try again later from settings.');
      // Still navigate even if face registration fails
      navigate('/elections');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipFace = () => {
    toast.info('You can register your face later from settings');
    navigate('/elections');
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const response = await authAPI.resendOTP({ email });
      
      // Auto-populate OTP in development mode
      if (response.data.developmentOTP) {
        setOtp(response.data.developmentOTP);
        toast.success(`Development OTP: ${response.data.developmentOTP}`);
        console.log('🔐 Auto-filled development OTP:', response.data.developmentOTP);
      } else {
        toast.success('OTP sent to your email');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Smart E-Voting</h2>
        <p className="text-gray-600 mb-6">Create your account</p>

        {step === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <FiUser className="text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className="flex-1 ml-2 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <FiPhone className="text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10 digit phone number"
                  className="flex-1 ml-2 outline-none"
                />
              </div>
            </div>

            {/* Location Selection */}
            <div className="col-span-2">
              <LocationDropdown
                countryId={formData.country_id}
                stateId={formData.state_id}
                onCountryChange={(value) => setFormData(prev => ({ ...prev, country_id: value, state_id: null }))}
                onStateChange={(value) => setFormData(prev => ({ ...prev, state_id: value }))}
                required={false}
              />
            </div>

            {(formData.role === 'election_officer' || formData.role === 'observer') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                    <FiBriefcase className="text-gray-400" />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="e.g., Election Commission, State Office"
                      className="flex-1 ml-2 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                  <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                    <FiBriefcase className="text-gray-400" />
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      placeholder="e.g., Senior Officer, Observer"
                      className="flex-1 ml-2 outline-none"
                    />
                  </div>
                </div>

                {formData.role === 'election_officer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Area (Optional)</label>
                    <input
                      type="text"
                      name="assignment_area"
                      value={formData.assignment_area}
                      onChange={handleInputChange}
                      placeholder="e.g., North District, Municipal Area"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <FiLock className="text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min 8 characters"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <FiLock className="text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  className="flex-1 ml-2 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-blue-500 hover:underline font-semibold">
                Login
              </a>
            </p>
          </form>
        ) : step === 'otp' ? (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <p className="text-gray-600 mb-4">
              An OTP has been sent to <strong>{email}</strong>
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
              className="w-full text-blue-500 hover:text-blue-600 font-semibold py-2"
            >
              Resend OTP
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('register');
                setOtp('');
              }}
              className="w-full text-gray-600 hover:text-gray-700 font-semibold py-2"
            >
              Back to Register
            </button>
          </form>
        ) : step === 'face' ? (
          <FaceCapture
            onCapture={handleFaceCapture}
            onSkip={handleSkipFace}
          />
        ) : null}
      </div>
    </div>
  );
};

export default Register;
