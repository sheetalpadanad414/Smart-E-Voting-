import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../contexts/authStore';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { MdHowToVote } from 'react-icons/md';

const LoginEnhanced = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isAdmin ? authAPI.adminLogin : authAPI.login;
      const response = await endpoint(formData);
      
      const { token, user } = response.data;
      
      login(token, user);
      
      toast.success(`Welcome back, ${user.name || user.email}!`);
      
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/elections';
      navigate(redirectPath);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl mb-4 animate-pulse">
            <MdHowToVote className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Smart E-Voting
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Secure, Transparent, Democratic
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 animate-scaleIn transition-colors">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to continue to your account
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              type="button"
              onClick={() => setIsAdmin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-smooth ${
                !isAdmin
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Voter Login
            </button>
            <button
              type="button"
              onClick={() => setIsAdmin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-smooth ${
                isAdmin
                  ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Admin Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400 dark:text-gray-500" size={20} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-smooth"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400 dark:text-gray-500" size={20} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-smooth"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 dark:from-blue-600 dark:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 text-white py-3 rounded-lg font-semibold transition-smooth disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <FiLogIn size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold transition-smooth"
          >
            <FiUserPlus size={20} />
            <span>Create New Account</span>
          </Link>

          {/* Demo Credentials */}
          {isAdmin && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-400 mb-2">Demo Admin Credentials:</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Email: admin@evoting.com<br />
                Password: admin123
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400 animate-fadeIn">
          <p>Secure and transparent voting system</p>
          <p className="mt-1">© 2024 Smart E-Voting. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginEnhanced;
