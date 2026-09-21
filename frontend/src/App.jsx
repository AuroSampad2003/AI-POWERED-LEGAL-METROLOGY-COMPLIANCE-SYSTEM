
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const PageTransition = ({ children }) => (
  <div className="page-shell">{children}</div>
);

// Public pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// User pages
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
import ViolationReview from './pages/admin/ViolationReview';
import ComplaintReview from './pages/admin/ComplaintReview';
import InspectionManagement from './pages/admin/InspectionManagement';
import InspectionDetail from './pages/admin/InspectionDetail';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminProducts from './pages/AdminProducts';
import AdminRules from './pages/AdminRules';
import AdminSettings from './pages/AdminSettings';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

          {/* User routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <PageTransition><Dashboard /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inspection/new"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <PageTransition><NewInspection /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inspections"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <PageTransition><MyInspections /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaints"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <PageTransition><MyComplaints /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/compliance-history"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <PageTransition><ComplianceHistory /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaints/new/:inspectionId"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <PageTransition><ComplaintSubmit /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaints/:id"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <PageTransition><ComplaintDetail /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/saved-products"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <PageTransition><SavedProducts /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/help"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <PageTransition><Help /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <PageTransition><Profile /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <PageTransition><Settings /></PageTransition>
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={<PageTransition><AdminDashboard /></PageTransition>}
          />

          <Route
            path="/admin/violations"
            element={<PageTransition><ViolationReview /></PageTransition>}
          />

          <Route
            path="/admin/violations/:id"
            element={<PageTransition><ComplaintReview /></PageTransition>}
          />

          <Route
            path="/admin/inspections"
            element={<PageTransition><InspectionManagement /></PageTransition>}
          />

          <Route
            path="/admin/inspections/:id"
            element={<PageTransition><InspectionDetail /></PageTransition>}
          />

          <Route path="/admin/analytics" element={<PageTransition><AdminAnalytics /></PageTransition>} />
          <Route path="/admin/products" element={<PageTransition><AdminProducts /></PageTransition>} />
          <Route path="/admin/rules" element={<PageTransition><AdminRules /></PageTransition>} />
          <Route path="/admin/settings" element={<PageTransition><AdminSettings /></PageTransition>} />
          <Route path="/admin/users" element={<PageTransition><AdminUsers /></PageTransition>} />

          {/* 404 route */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;