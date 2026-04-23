import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../contexts/authStore';
import useThemeStore from '../contexts/themeStore';
import { FiMenu, FiX, FiLogOut, FiUser, FiMoon, FiSun } from 'react-icons/fi';
import { MdHowToVote } from 'react-icons/md';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout
  }));
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getNavLinks = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        return {
          desktop: (
            <>
              <Link to="/admin/dashboard" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth">Dashboard</Link>
              <Link to="/admin/users" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth">Users</Link>
              <Link to="/admin/elections" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth">Elections</Link>
              <Link to="/admin/institutional" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth">Institutional</Link>
            </>
          ),
          mobile: (
            <>
              <Link to="/admin/dashboard" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth block" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <Link to="/admin/users" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth block" onClick={() => setIsMenuOpen(false)}>Users</Link>
              <Link to="/admin/elections" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth block" onClick={() => setIsMenuOpen(false)}>Elections</Link>
              <Link to="/admin/institutional" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth block" onClick={() => setIsMenuOpen(false)}>Institutional</Link>
            </>
          ),
          dashboard: '/admin/dashboard'
        };
      case 'election_officer':
        return {
          desktop: (
            <>
              <Link to="/election-officer/dashboard" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth">Dashboard</Link>
              <Link to="/election-officer/monitoring" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth">Monitor</Link>
              <Link to="/election-officer/reports" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth">Reports</Link>
            </>
          ),
          mobile: (
            <>
              <Link to="/election-officer/dashboard" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth block" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <Link to="/election-officer/monitoring" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth block" onClick={() => setIsMenuOpen(false)}>Monitor</Link>
              <Link to="/election-officer/reports" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth block" onClick={() => setIsMenuOpen(false)}>Reports</Link>
            </>
          ),
          dashboard: '/election-officer/dashboard'
        };
      case 'observer':
        return {
          desktop: (
            <>
              <Link to="/observer/dashboard" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth">Elections</Link>
              <Link to="/observer/dashboard" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth">Analysis</Link>
            </>
          ),
          mobile: (
            <>
              <Link to="/observer/dashboard" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth block" onClick={() => setIsMenuOpen(false)}>Elections</Link>
              <Link to="/observer/dashboard" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth block" onClick={() => setIsMenuOpen(false)}>Analysis</Link>
            </>
          ),
          dashboard: '/observer/dashboard'
        };
      case 'voter':
      default:
        return {
          desktop: (
            <>
              <Link to="/elections" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth">Elections</Link>
              <Link to="/history" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth">My History</Link>
            </>
          ),
          mobile: (
            <>
              <Link to="/elections" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth block" onClick={() => setIsMenuOpen(false)}>Elections</Link>
              <Link to="/history" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-smooth block" onClick={() => setIsMenuOpen(false)}>My History</Link>
            </>
          ),
          dashboard: '/elections'
        };
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-gray-800 dark:to-gray-900 text-white shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link to={user ? navLinks?.dashboard : '/'} className="flex items-center space-x-2 font-bold text-xl hover:opacity-90 transition-smooth">
            <MdHowToVote size={28} className="animate-pulse" />
            <span className="hidden sm:inline">Smart E-Voting</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                {navLinks?.desktop}
                
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-blue-700 dark:hover:bg-gray-700 transition-smooth ml-2"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                </button>
                
                {/* User Dropdown */}
                <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-blue-400 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <FiUser size={18} />
                    </div>
                    <div className="text-right hidden lg:block">
                      <p className="text-sm font-semibold">{user.name || user.email}</p>
                      <p className="text-xs opacity-75 capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-4 py-2 bg-red-500 dark:bg-red-600 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-smooth"
                  >
                    <FiLogOut size={18} />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Dark Mode Toggle for non-authenticated users */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-blue-700 dark:hover:bg-gray-700 transition-smooth"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                </button>
                <Link to="/login" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-gray-700 transition-smooth">Login</Link>
                <Link to="/register" className="px-4 py-2 bg-white dark:bg-gray-700 text-blue-600 dark:text-white rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 transition-smooth">Register</Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button onClick={toggleMenu} className="md:hidden text-white hover:opacity-80 transition-smooth">
            {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 flex flex-col space-y-2 border-t border-blue-400 dark:border-gray-600 pt-4 animate-fadeIn">
            {user ? (
              <>
                {navLinks?.mobile}
                
                {/* Dark Mode Toggle Mobile */}
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-gray-700 transition-smooth"
                >
                  {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                
                <div className="border-t border-blue-400 dark:border-gray-600 pt-2">
                  <div className="flex items-center space-x-2 px-4 py-2">
                    <div className="w-10 h-10 bg-blue-500 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <FiUser size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user.name || user.email}</p>
                      <p className="text-xs opacity-75 capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 bg-red-500 dark:bg-red-600 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-smooth text-left mt-2"
                  >
                    <FiLogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Dark Mode Toggle Mobile */}
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-gray-700 transition-smooth"
                >
                  {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <Link to="/login" className="px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-gray-700 transition-smooth block" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="px-4 py-2 bg-white dark:bg-gray-700 text-blue-600 dark:text-white rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 transition-smooth block text-center" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
