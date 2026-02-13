import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
// ProtectedRoute unused here; routes are guarded inline
import useAuthStore from './contexts/authStore';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminElections from './pages/AdminElections';

// Voter Pages
import VoterElections from './pages/VoterElections';
import VoteElection from './pages/VoteElection';
import ElectionResults from './pages/ElectionResults';

// Election Officer Pages
import ElectionOfficerDashboard from './pages/ElectionOfficerDashboard';
import ElectionOfficerMonitoring from './pages/ElectionOfficerMonitoring';
import ElectionOfficerReports from './pages/ElectionOfficerReports';

// Observer Pages
import ObserverDashboard from './pages/ObserverDashboard';
import ObserverAnalysis from './pages/ObserverAnalysis';

const App = () => {
  const { user, token } = useAuthStore();

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!token ? <Login /> : <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'election_officer' ? '/election-officer/dashboard' : user?.role === 'observer' ? '/observer/dashboard' : '/elections'} />} />
          <Route path="/register" element={!token ? <Register /> : <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'election_officer' ? '/election-officer/dashboard' : user?.role === 'observer' ? '/observer/dashboard' : '/elections'} />} />

          {/* Admin Routes */}
          {token && user?.role === 'admin' && (
            <>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/elections" element={<AdminElections />} />
            </>
          )}

          {/* Voter Routes */}
          {token && user?.role === 'voter' && (
            <>
              <Route path="/elections" element={<VoterElections />} />
              <Route path="/elections/:id" element={<VoteElection />} />
              <Route path="/results/:id" element={<ElectionResults />} />
              <Route path="/history" element={<VoterElections />} />
            </>
          )}

          {/* Election Officer Routes */}
          {token && user?.role === 'election_officer' && (
            <>
              <Route path="/election-officer/dashboard" element={<ElectionOfficerDashboard />} />
              <Route path="/election-officer/monitoring" element={<ElectionOfficerMonitoring />} />
              <Route path="/election-officer/monitoring/:electionId" element={<ElectionOfficerMonitoring />} />
              <Route path="/election-officer/reports" element={<ElectionOfficerReports />} />
            </>
          )}

          {/* Observer Routes */}
          {token && user?.role === 'observer' && (
            <>
              <Route path="/observer/dashboard" element={<ObserverDashboard />} />
              <Route path="/observer/elections" element={<ObserverDashboard />} />
              <Route path="/observer/elections/:electionId/results" element={<ObserverAnalysis />} />
              <Route path="/observer/elections/:electionId/analysis" element={<ObserverAnalysis />} />
            </>
          )}

          {/* Fallback */}
          <Route path="*" element={token ? <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'election_officer' ? '/election-officer/dashboard' : user?.role === 'observer' ? '/observer/dashboard' : '/elections'} /> : <Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
