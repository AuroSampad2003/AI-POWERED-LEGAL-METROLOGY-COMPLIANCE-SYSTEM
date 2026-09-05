import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewInspection from './pages/NewInspection';
import MyInspections from './pages/MyInspections';
import MyComplaints from './pages/MyComplaints';
import ComplianceHistory from './pages/ComplianceHistory';
import SavedProducts from './pages/SavedProducts';
import Help from './pages/Help';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <div>Admin Dashboard placeholder</div>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
