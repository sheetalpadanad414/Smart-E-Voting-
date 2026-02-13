import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../contexts/authStore';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, token } = useAuthStore((state) => ({
    user: state.user,
    token: state.token
  }));

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
