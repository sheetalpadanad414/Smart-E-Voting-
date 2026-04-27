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
import FaceVerification from './pages/FaceVerification';
import CastVote from './pages/CastVote';
import VoteSuccess from './pages/VoteSuccess';

// Admin Pages
import AdminDashboard from './pages/AdminDashboardEnhanced';
import AdminUsers from './pages/AdminUsers';
import AdminVoters from './pages/AdminVoters';
import AdminElections from './pages/AdminElectionsEnhanced';
import AdminElectionsDashboard from './pages/AdminElectionsDashboard';
import ManageElections from './pages/ManageElections';
import NationalElectionsManage from './pages/NationalElectionsManage';
import StateElectionsManage from './pages/StateElectionsManage';
import LocalElectionsManage from './pages/LocalElectionsManage';
import InstitutionalElectionsManage from './pages/InstitutionalElectionsManage';
import AdminElectionCategories from './pages/AdminElectionCategories';
import AdminCategoryElections from './pages/AdminCategoryElections';
import AdminCandidates from './pages/AdminCandidates';
import AdminParties from './pages/AdminPartiesEnhanced';
import InstitutionalElections from './pages/InstitutionalElections';
import InstitutionalCandidates from './pages/InstitutionalCandidates';

// Voter Pages
import VoterElections from './pages/VoterElectionsEnhanced';
import UserCategoryElections from './pages/UserCategoryElections';
import ElectionResults from './pages/ElectionResults';
import VotingHistory from './pages/VotingHistory';
import ElectionResultsPage from './pages/ElectionResultsPage';

// Election Officer Pages
import ElectionOfficerDashboard from './pages/ElectionOfficerDashboard';
import ElectionOfficerMonitoring from './pages/ElectionOfficerMonitoring';
import ElectionOfficerReports from './pages/ElectionOfficerReports';

// Observer Pages
import ObserverDashboard from './pages/ObserverDashboard';
import ObserverAnalysis from './pages/ObserverAnalysis';

// Debug
import DebugAuth from './pages/DebugAuth';

const App = () => {
  const { user, token } = useAuthStore();

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 App - Auth State:', { 
      hasToken: !!token, 
      hasUser: !!user, 
      userRole: user?.role,
      currentPath: window.location.pathname 
    });
  }, [user, token]);

  // Helper component for role-based routing - CHECK LOCALSTORAGE DIRECTLY
  const RoleRoute = ({ children, allowedRoles }) => {
    // Check localStorage directly to avoid race conditions
    const tokenFromStorage = localStorage.getItem('token');
    const userFromStorage = localStorage.getItem('user');
    
    let userObj = null;
    try {
      if (userFromStorage && userFromStorage !== 'undefined' && userFromStorage !== 'null') {
        userObj = JSON.parse(userFromStorage);
        
        // Validate user object has required fields
        if (!userObj || !userObj.role || !userObj.email) {
          console.error('❌ Invalid user object in localStorage:', userObj);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          userObj = null;
        }
      }
    } catch (e) {
      console.error('❌ Error parsing user from localStorage:', e);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      userObj = null;
    }
    
    console.log('🔍 RoleRoute Check:', { 
      hasTokenInStorage: !!tokenFromStorage,
      hasUserInStorage: !!userObj,
      userRole: userObj?.role, 
      allowedRoles,
      zustandToken: !!token,
      zustandUser: !!user
    });
    
    // Check localStorage first, then fall back to Zustand state
    const hasAuth = (tokenFromStorage && userObj) || (token && user);
    const currentUser = userObj || user;
    
    if (!hasAuth || !currentUser) {
      console.log('❌ RoleRoute: No auth, redirecting to login');
      return <Navigate to="/login" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      console.log('❌ RoleRoute: Wrong role, redirecting to home');
      return <Navigate to="/" replace />;
    }
    
    console.log('✓ RoleRoute: Access granted');
    return children;
  };

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes with Layout */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route 
          path="/login" 
          element={
            (() => {
              const tokenFromStorage = localStorage.getItem('token');
              const userFromStorage = localStorage.getItem('user');
              let userObj = null;
              
              try {
                if (userFromStorage && userFromStorage !== 'undefined' && userFromStorage !== 'null') {
                  userObj = JSON.parse(userFromStorage);
                  
                  // Validate user object
                  if (!userObj || !userObj.role || !userObj.email) {
                    console.error('❌ Invalid user in localStorage, clearing...');
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    userObj = null;
                  }
                }
              } catch (e) {
                console.error('❌ Error parsing user, clearing localStorage:', e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                userObj = null;
              }
              
              const isAuthenticated = (tokenFromStorage && userObj) || (token && user);
              const currentUser = userObj || user;
              
              if (isAuthenticated && currentUser) {
                const redirectPath = currentUser.role === 'admin' ? '/admin/dashboard' : '/elections';
                console.log('🔄 Login route: Already authenticated, redirecting to', redirectPath);
                return <Navigate to={redirectPath} replace />;
              }
              
              return <Layout><Login /></Layout>;
            })()
          } 
        />
        <Route 
          path="/register" 
          element={
            (() => {
              // Check if face registration is in progress
              const faceRegistrationInProgress = sessionStorage.getItem('faceRegistrationInProgress');
              
              // If face registration in progress, allow access to register page
              if (faceRegistrationInProgress === 'true') {
                return <Layout><Register /></Layout>;
              }
              
              const tokenFromStorage = localStorage.getItem('token');
              const userFromStorage = localStorage.getItem('user');
              let userObj = null;
              
              try {
                if (userFromStorage && userFromStorage !== 'undefined' && userFromStorage !== 'null') {
                  userObj = JSON.parse(userFromStorage);
                  
                  // Validate user object
                  if (!userObj || !userObj.role || !userObj.email) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    userObj = null;
                  }
                }
              } catch (e) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                userObj = null;
              }
              
              const isAuthenticated = (tokenFromStorage && userObj) || (token && user);
              const currentUser = userObj || user;
              
              if (isAuthenticated && currentUser) {
                const redirectPath = currentUser.role === 'admin' ? '/admin/dashboard' : '/elections';
                return <Navigate to={redirectPath} replace />;
              }
              
              return <Layout><Register /></Layout>;
            })()
          } 
        />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/face-verification" element={<RoleRoute allowedRoles={['voter']}><FaceVerification /></RoleRoute>} />
        <Route path="/cast-vote" element={<CastVote />} />
        <Route path="/vote-success" element={<VoteSuccess />} />
        <Route path="/results" element={<ElectionResultsPage />} />
        <Route path="/debug-auth" element={<DebugAuth />} />

        {/* Admin Routes - No Layout */}
        <Route path="/admin/dashboard" element={<RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute>} />
        <Route path="/admin/users" element={<RoleRoute allowedRoles={['admin']}><AdminUsers /></RoleRoute>} />
        <Route path="/admin/voters" element={<RoleRoute allowedRoles={['admin']}><AdminVoters /></RoleRoute>} />
        <Route path="/admin/elections" element={<RoleRoute allowedRoles={['admin']}><AdminElectionsDashboard /></RoleRoute>} />
        <Route path="/admin/elections/manage" element={<RoleRoute allowedRoles={['admin']}><ManageElections /></RoleRoute>} />
        <Route path="/admin/elections/national" element={<RoleRoute allowedRoles={['admin']}><NationalElectionsManage /></RoleRoute>} />
        <Route path="/admin/elections/state" element={<RoleRoute allowedRoles={['admin']}><StateElectionsManage /></RoleRoute>} />
        <Route path="/admin/elections/local" element={<RoleRoute allowedRoles={['admin']}><LocalElectionsManage /></RoleRoute>} />
        <Route path="/admin/elections/institutional" element={<RoleRoute allowedRoles={['admin']}><InstitutionalElectionsManage /></RoleRoute>} />
        <Route path="/admin/elections/all" element={<RoleRoute allowedRoles={['admin']}><AdminElections /></RoleRoute>} />
        <Route path="/admin/elections/category/:categoryId" element={<RoleRoute allowedRoles={['admin']}><AdminCategoryElections /></RoleRoute>} />
        <Route path="/admin/parties" element={<RoleRoute allowedRoles={['admin']}><AdminParties /></RoleRoute>} />
        <Route path="/admin/candidates" element={<RoleRoute allowedRoles={['admin']}><AdminCandidates /></RoleRoute>} />
        <Route path="/admin/candidates/:electionId" element={<RoleRoute allowedRoles={['admin']}><AdminCandidates /></RoleRoute>} />
        <Route path="/admin/institutional" element={<RoleRoute allowedRoles={['admin']}><InstitutionalElections /></RoleRoute>} />
        <Route path="/admin/institutional/candidates/:electionId" element={<RoleRoute allowedRoles={['admin']}><InstitutionalCandidates /></RoleRoute>} />

        {/* Voter Routes with Layout */}
        <Route path="/elections" element={<RoleRoute allowedRoles={['voter']}><Layout><VoterElections /></Layout></RoleRoute>} />
        <Route path="/user/elections" element={<RoleRoute allowedRoles={['voter']}><UserCategoryElections /></RoleRoute>} />
        <Route path="/elections/:id/vote" element={<RoleRoute allowedRoles={['voter', 'admin']}><CastVote /></RoleRoute>} />
        <Route path="/results/:id" element={<RoleRoute allowedRoles={['voter', 'admin']}><Layout><ElectionResults /></Layout></RoleRoute>} />
        <Route path="/voter/history" element={<RoleRoute allowedRoles={['voter']}><VotingHistory /></RoleRoute>} />

        {/* Election Officer Routes with Layout */}
        <Route path="/election-officer/dashboard" element={<RoleRoute allowedRoles={['election_officer']}><Layout><ElectionOfficerDashboard /></Layout></RoleRoute>} />
        <Route path="/election-officer/monitoring" element={<RoleRoute allowedRoles={['election_officer']}><Layout><ElectionOfficerMonitoring /></Layout></RoleRoute>} />
        <Route path="/election-officer/monitoring/:electionId" element={<RoleRoute allowedRoles={['election_officer']}><Layout><ElectionOfficerMonitoring /></Layout></RoleRoute>} />
        <Route path="/election-officer/reports" element={<RoleRoute allowedRoles={['election_officer']}><Layout><ElectionOfficerReports /></Layout></RoleRoute>} />

        {/* Observer Routes with Layout */}
        <Route path="/observer/dashboard" element={<RoleRoute allowedRoles={['observer']}><Layout><ObserverDashboard /></Layout></RoleRoute>} />
        <Route path="/observer/elections" element={<RoleRoute allowedRoles={['observer']}><Layout><ObserverDashboard /></Layout></RoleRoute>} />
        <Route path="/observer/elections/:electionId/results" element={<RoleRoute allowedRoles={['observer']}><Layout><ObserverAnalysis /></Layout></RoleRoute>} />
        <Route path="/observer/elections/:electionId/analysis" element={<RoleRoute allowedRoles={['observer']}><Layout><ObserverAnalysis /></Layout></RoleRoute>} />

        {/* Fallback */}
        <Route path="*" element={token ? <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/elections'} replace /> : <Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
