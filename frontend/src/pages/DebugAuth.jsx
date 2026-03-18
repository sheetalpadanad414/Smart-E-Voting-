import React from 'react';
import useAuthStore from '../contexts/authStore';
import { useNavigate } from 'react-router-dom';

const DebugAuth = () => {
  const { user, token, login, logout } = useAuthStore();
  const navigate = useNavigate();

  const testLogin = () => {
    const testUser = {
      id: '123',
      name: 'Test Admin',
      email: 'admin@evoting.com',
      role: 'admin'
    };
    const testToken = 'test-token-123';
    
    login(testUser, testToken);
    console.log('Test login executed');
  };

  const navigateToDashboard = () => {
    navigate('/admin/dashboard', { replace: true });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Auth Debug Page</h1>
      
      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
        <h3>Current Auth State:</h3>
        <pre>{JSON.stringify({ user, token: token?.substring(0, 30) + '...' }, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
        <h3>LocalStorage:</h3>
        <pre>
          User: {localStorage.getItem('user')}
          {'\n'}
          Token: {localStorage.getItem('token')?.substring(0, 30)}...
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={testLogin} style={{ padding: '10px', marginRight: '10px' }}>
          Test Login
        </button>
        <button onClick={navigateToDashboard} style={{ padding: '10px', marginRight: '10px' }}>
          Navigate to Dashboard
        </button>
        <button onClick={logout} style={{ padding: '10px' }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default DebugAuth;
