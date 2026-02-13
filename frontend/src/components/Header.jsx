import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../contexts/authStore';
import { FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import { MdHowToVote } from 'react-icons/md';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout
  }));
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
              <Link to="/admin/dashboard" className="px-4 py-2 rounded hover:bg-blue-700 transition">Dashboard</Link>
              <Link to="/admin/users" className="px-4 py-2 rounded hover:bg-blue-700 transition">Users</Link>
              <Link to="/admin/elections" className="px-4 py-2 rounded hover:bg-blue-700 transition">Elections</Link>
            </>
          ),
          mobile: (
            <>
              <Link to="/admin/dashboard" className="px-4 py-2 rounded hover:bg-blue-700 transition block" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <Link to="/admin/users" className="px-4 py-2 rounded hover:bg-blue-700 transition block" onClick={() => setIsMenuOpen(false)}>Users</Link>
              <Link to="/admin/elections" className="px-4 py-2 rounded hover:bg-blue-700 transition block" onClick={() => setIsMenuOpen(false)}>Elections</Link>
            </>
          ),
          dashboard: '/admin/dashboard'
        };
      case 'election_officer':
        return {
          desktop: (
            <>
              <Link to="/election-officer/dashboard" className="px-4 py-2 rounded hover:bg-blue-700 transition">Dashboard</Link>
              <Link to="/election-officer/monitoring" className="px-4 py-2 rounded hover:bg-blue-700 transition">Monitor</Link>
              <Link to="/election-officer/reports" className="px-4 py-2 rounded hover:bg-blue-700 transition">Reports</Link>
            </>
          ),
          mobile: (
            <>
              <Link to="/election-officer/dashboard" className="px-4 py-2 rounded hover:bg-blue-700 transition block" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <Link to="/election-officer/monitoring" className="px-4 py-2 rounded hover:bg-blue-700 transition block" onClick={() => setIsMenuOpen(false)}>Monitor</Link>
              <Link to="/election-officer/reports" className="px-4 py-2 rounded hover:bg-blue-700 transition block" onClick={() => setIsMenuOpen(false)}>Reports</Link>
            </>
          ),
          dashboard: '/election-officer/dashboard'
        };
      case 'observer':
        return {
          desktop: (
            <>
              <Link to="/observer/dashboard" className="px-4 py-2 rounded hover:bg-blue-700 transition">Elections</Link>
              <Link to="/observer/dashboard" className="px-4 py-2 rounded hover:bg-blue-700 transition">Analysis</Link>
            </>
          ),
          mobile: (
            <>
              <Link to="/observer/dashboard" className="px-4 py-2 rounded hover:bg-blue-700 transition block" onClick={() => setIsMenuOpen(false)}>Elections</Link>
              <Link to="/observer/dashboard" className="px-4 py-2 rounded hover:bg-blue-700 transition block" onClick={() => setIsMenuOpen(false)}>Analysis</Link>
            </>
          ),
          dashboard: '/observer/dashboard'
        };
      case 'voter':
      default:
        return {
          desktop: (
            <>
              <Link to="/elections" className="px-4 py-2 rounded hover:bg-blue-700 transition">Elections</Link>
              <Link to="/history" className="px-4 py-2 rounded hover:bg-blue-700 transition">My History</Link>
            </>
          ),
          mobile: (
            <>
              <Link to="/elections" className="px-4 py-2 rounded hover:bg-blue-700 transition block" onClick={() => setIsMenuOpen(false)}>Elections</Link>
              <Link to="/history" className="px-4 py-2 rounded hover:bg-blue-700 transition block" onClick={() => setIsMenuOpen(false)}>My History</Link>
            </>
          ),
          dashboard: '/elections'
        };
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link to={user ? navLinks?.dashboard : '/'} className="flex items-center space-x-2 font-bold text-xl hover:opacity-90 transition">
            <MdHowToVote size={28} />
            <span>Smart E-Voting</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                {navLinks?.desktop}
                
                {/* User Dropdown */}
                <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-blue-400">
                  <div className="flex items-center space-x-2">
                    <FiUser size={20} />
                    <div className="text-right">
                      <p className="text-sm font-semibold">{user.name || user.email}</p>
                      <p className="text-xs opacity-75">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-4 py-2 bg-red-500 rounded hover:bg-red-600 transition"
                  >
                    <FiLogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded hover:bg-blue-700 transition">Login</Link>
                <Link to="/register" className="px-4 py-2 bg-white text-blue-600 rounded font-semibold hover:bg-gray-100 transition">Register</Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button onClick={toggleMenu} className="md:hidden text-white hover:opacity-80">
            {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 flex flex-col space-y-2 border-t border-blue-400 pt-4">
            {user ? (
              <>
                {navLinks?.mobile}
                <div className="border-t border-blue-400 pt-2">
                  <p className="px-4 py-2 text-sm font-semibold">{user.name || user.email}</p>
                  <p className="px-4 py-1 text-xs opacity-75 mb-2">{user.role}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 bg-red-500 rounded hover:bg-red-600 transition text-left"
                  >
                    <FiLogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded hover:bg-blue-700 transition block" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="px-4 py-2 bg-white text-blue-600 rounded font-semibold hover:bg-gray-100 transition block text-center" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
