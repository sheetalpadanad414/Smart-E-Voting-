import { create } from 'zustand';

const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null;
    }
    const user = JSON.parse(userStr);
    
    // Validate user has required fields
    if (!user || !user.role || !user.email) {
      console.error('Auth Store: Invalid user object in localStorage:', user);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Auth Store: Error parsing user from localStorage:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
};

const getTokenFromStorage = () => {
  const token = localStorage.getItem('token');
  if (!token || token === 'undefined' || token === 'null') {
    return null;
  }
  return token;
};

const useAuthStore = create((set, get) => ({
  user: getUserFromStorage(),
  token: getTokenFromStorage(),

  login: (user, token) => {
    console.log('🔐 Auth Store - Login called:', { user, token: token?.substring(0, 20) + '...' });
    
    // Validate inputs
    if (!user || !token) {
      console.error('❌ Auth Store: Cannot login with null user or token');
      return;
    }
    
    if (!user.role || !user.email) {
      console.error('❌ Auth Store: User missing required fields:', user);
      return;
    }
    
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
    console.log('✓ Auth Store - State updated');
    console.log('✓ Saved user:', JSON.parse(localStorage.getItem('user')));
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const state = get();
    return !!state.token && !!state.user;
  },

  // Check if user is admin
  isAdmin: () => {
    const state = get();
    return state.user?.role === 'admin';
  },

  // Check if user is voter
  isVoter: () => {
    const state = get();
    return state.user?.role === 'voter';
  }
}));

export default useAuthStore;
