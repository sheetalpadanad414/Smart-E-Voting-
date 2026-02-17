import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
// ProtectedRoute unused here; routes are guarded inline
import useAuthStore from './contexts/authStore';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import CastVote from './pages/CastVote';
import VoteSuccess from './pages/VoteSuccess';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminElections from './pages/AdminElections';
import AdminCandidates from './pages/AdminCandidates';

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
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes with Layout */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={!token ? <Layout><Login /></Layout> : <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/elections'} />} />
        <Route path="/register" element={!token ? <Layout><Register /></Layout> : <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/elections'} />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/cast-vote" element={<CastVote />} />
        <Route path="/vote-success" element={<VoteSuccess />} />

        {/* Admin Routes - No Layout */}
        {token && user?.role === 'admin' && (
          <>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/elections" element={<AdminElections />} />
            <Route path="/admin/candidates" element={<AdminCandidates />} />
            <Route path="/admin/candidates/:electionId" element={<AdminCandidates />} />
          </>
        )}

        {/* Voter Routes with Layout */}
        {token && user?.role === 'voter' && (
          <>
            <Route path="/elections" element={<Layout><VoterElections /></Layout>} />
            <Route path="/elections/:id" element={<Layout><VoteElection /></Layout>} />
            <Route path="/results/:id" element={<Layout><ElectionResults /></Layout>} />
            <Route path="/history" element={<Layout><VoterElections /></Layout>} />
          </>
        )}

        {/* Election Officer Routes with Layout */}
        {token && user?.role === 'election_officer' && (
          <>
            <Route path="/election-officer/dashboard" element={<Layout><ElectionOfficerDashboard /></Layout>} />
            <Route path="/election-officer/monitoring" element={<Layout><ElectionOfficerMonitoring /></Layout>} />
            <Route path="/election-officer/monitoring/:electionId" element={<Layout><ElectionOfficerMonitoring /></Layout>} />
            <Route path="/election-officer/reports" element={<Layout><ElectionOfficerReports /></Layout>} />
          </>
        )}

        {/* Observer Routes with Layout */}
        {token && user?.role === 'observer' && (
          <>
            <Route path="/observer/dashboard" element={<Layout><ObserverDashboard /></Layout>} />
            <Route path="/observer/elections" element={<Layout><ObserverDashboard /></Layout>} />
            <Route path="/observer/elections/:electionId/results" element={<Layout><ObserverAnalysis /></Layout>} />
            <Route path="/observer/elections/:electionId/analysis" element={<Layout><ObserverAnalysis /></Layout>} />
          </>
        )}

        {/* Fallback */}
        <Route path="*" element={token ? <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/elections'} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
