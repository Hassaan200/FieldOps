import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import CreateJob from './pages/admin/CreateJob';
import ManageJobs from './pages/admin/ManageJobs';
import TechnicianJobs from './pages/technician/MyJobs';
import ClientJobs from './pages/client/MyJobs';
import ManageUsers from './pages/admin/ManageUsers';
import Profile from './pages/admin/Profile';
import Landing from './pages/Landing';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/jobs/create" element={
            <ProtectedRoute role="admin"><CreateJob /></ProtectedRoute>
          } />
          <Route path="/admin/jobs" element={
            <ProtectedRoute role="admin"><ManageJobs /></ProtectedRoute>
          } />

          <Route path="/technician/jobs" element={
            <ProtectedRoute role="technician"><TechnicianJobs /></ProtectedRoute>
          } />

          <Route path="/client/jobs" element={
            <ProtectedRoute role="client"><ClientJobs /></ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute role="admin"><ManageUsers /></ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;