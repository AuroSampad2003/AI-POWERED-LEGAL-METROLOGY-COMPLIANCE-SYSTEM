import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import NewInspection from './pages/NewInspection';
import MyInspections from './pages/MyInspections';
import MyComplaints from './pages/MyComplaints';
import ComplianceHistory from './pages/ComplianceHistory';
import ComplaintSubmit from './pages/ComplaintSubmit';
import ComplaintDetail from './pages/ComplaintDetail';
import SavedProducts from './pages/SavedProducts';
import Help from './pages/Help';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminInspections from './pages/AdminInspections';
import AdminProducts from './pages/AdminProducts';
import AdminViolations from './pages/AdminViolations';
import AdminUsers from './pages/AdminUsers';
import AdminRules from './pages/AdminRules';
import AdminSettings from './pages/AdminSettings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ==================== AUTH ==================== */}

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ==================== USER ==================== */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inspection/new"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <NewInspection />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inspections"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <MyInspections />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaints"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <MyComplaints />
              </ProtectedRoute>
            }
          />

          <Route
            path="/compliance-history"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <ComplianceHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaints/new/:inspectionId"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <ComplaintSubmit />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaints/:id"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <ComplaintDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/saved-products"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <SavedProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/help"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <Help />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* ==================== ADMIN ==================== */}

          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/analytics"
            element={<AdminAnalytics />}
          />

          <Route
            path="/admin/inspections"
            element={<AdminInspections />}
          />

          <Route
            path="/admin/products"
            element={<AdminProducts />}
          />

          <Route
            path="/admin/violations"
            element={<AdminViolations />}
          />

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />

          <Route
            path="/admin/rules"
            element={<AdminRules />}
          />

          <Route
            path="/admin/settings"
            element={<AdminSettings />}
          />

          {/* ==================== 404 ==================== */}

          <Route
            path="*"
            element={<div>Page Not Found</div>}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;