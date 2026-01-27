import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import CampaignsPage from "./pages/CampaignsPage";
import "./App.css";

// Placeholder pages for future implementation
const PlaceholderPage = ({ title }) => (
  <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
    <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">{title}</h1>
    <p className="font-body text-slate-500">Esta sección estará disponible próximamente.</p>
  </div>
);

const ProposalsPage = () => <PlaceholderPage title="Propuestas" />;
const ValidationsPage = () => <PlaceholderPage title="Validaciones" />;
const HealthFacilitiesPage = () => <PlaceholderPage title="Unidades de Salud" />;
const UsersPage = () => <PlaceholderPage title="Usuarios" />;

// Redirect authenticated users away from login
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns"
        element={
          <ProtectedRoute allowedRoles={['admin', 'hr_manager', 'state_coordinator', 'viewer']}>
            <Layout>
              <CampaignsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/proposals"
        element={
          <ProtectedRoute allowedRoles={['admin', 'hr_manager', 'validator', 'state_coordinator', 'viewer']}>
            <Layout>
              <ProposalsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/validations"
        element={
          <ProtectedRoute allowedRoles={['admin', 'validator']}>
            <Layout>
              <ValidationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/health-facilities"
        element={
          <ProtectedRoute allowedRoles={['admin', 'hr_manager', 'state_coordinator']}>
            <Layout>
              <HealthFacilitiesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <UsersPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
