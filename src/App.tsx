import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import TasksPage from './pages/TasksPage';
import TaskSubmissionPage from './pages/TaskSubmissionPage';
import PaymentSummaryPage from './pages/PaymentSummaryPage';
import TeamManagementPage from './pages/TeamManagementPage';
import TaskAssignmentPage from './pages/TaskAssignmentPage';
import VerificationPage from './pages/VerificationPage';
import AllTeams from './pages/AllTeams';

function ProtectedRoute({ roles }: { roles?: string[] }) {
  const { currentUser, userData, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (roles && userData && !roles.includes(userData.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/submit-task" element={<TaskSubmissionPage />} />
            <Route path="/payment-summary" element={<PaymentSummaryPage />} />
            <Route path="/team-management" element={<ProtectedRoute roles={['state_head']} />}> 
              <Route index element={<TeamManagementPage />} />
            </Route>
            <Route path="/assign-tasks" element={<ProtectedRoute roles={['state_head']} />}> 
              <Route index element={<TaskAssignmentPage />} />
            </Route>
            <Route path="/verification" element={<ProtectedRoute roles={['super_admin']} />}> 
              <Route index element={<VerificationPage />} />
            </Route>            
            <Route path="/all-teams" element={<ProtectedRoute roles={['super_admin']} />}> 
              <Route index element={<AllTeams />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
