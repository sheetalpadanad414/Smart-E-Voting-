import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token') || null,

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
