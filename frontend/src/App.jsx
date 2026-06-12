import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './store/slices/authSlice';

// Shell layouts
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Page Views
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientProfile from './pages/PatientProfile';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import Staff from './pages/Staff';
import Reports from './pages/Reports';
import Unauthorized from './pages/Unauthorized';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Attempt auto login using token cache on mount
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Private Main Clinic Console */}
        <Route 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Universal Protected pages */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/staff" element={<Staff />} />

          {/* Role restricted routes */}
          <Route 
            path="/patients" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Dentist', 'Receptionist', 'Dental Assistant']}>
                <Patients />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients/:id" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Dentist', 'Receptionist', 'Dental Assistant']}>
                <PatientProfile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/appointments" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Dentist', 'Receptionist']}>
                <Appointments />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/billing" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Accountant', 'Receptionist']}>
                <Billing />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Dental Assistant']}>
                <Inventory />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/reports" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Dentist', 'Accountant', 'Receptionist']}>
                <Reports />
              </ProtectedRoute>
            } 
          />

        </Route>

        {/* Fallback Redirects */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
