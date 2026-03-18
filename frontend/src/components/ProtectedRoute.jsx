import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../contexts/authStore';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  // Check localStorage directly first to avoid race conditions
  const tokenFromStorage = localStorage.getItem('token');
  const userFromStorage = localStorage.getItem('user');
  
  let userObj = null;
  try {
    if (userFromStorage && userFromStorage !== 'undefined' && userFromStorage !== 'null') {
      userObj = JSON.parse(userFromStorage);
      
      // Validate user object has required fields
      if (!userObj || !userObj.role || !userObj.email) {
        console.error('ProtectedRoute: Invalid user object, clearing localStorage');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        userObj = null;
      }
    }
  } catch (e) {
    console.error('ProtectedRoute: Error parsing user from localStorage:', e);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    userObj = null;
  }
  
  // Get Zustand state as fallback
  const { user: zustandUser, token: zustandToken } = useAuthStore((state) => ({
    user: state.user,
    token: state.token
  }));
  
  // Use localStorage values if available, otherwise fall back to Zustand
  const token = tokenFromStorage || zustandToken;
  const user = userObj || zustandUser;
  
  console.log('🔒 ProtectedRoute Check:', {
    hasToken: !!token,
    hasUser: !!user,
    userRole: user?.role,
    requiredRole
  });

  if (!token || !user) {
    console.log('❌ ProtectedRoute: No auth, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log('❌ ProtectedRoute: Wrong role, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('✓ ProtectedRoute: Access granted');
  return children;
};

export default ProtectedRoute;
