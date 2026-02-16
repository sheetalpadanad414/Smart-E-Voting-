import { create } from 'zustand';

const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null;
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    localStorage.removeItem('user');
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
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
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
