import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ROLES } from "./lib/constants";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";

// Planeación
import PlaneacionCampaignsPage from "./pages/planeacion/CampaignsPage";
import CampaignDetailPage from "./pages/planeacion/CampaignDetailPage";

// Atención a la Salud
import AtencionSaludReviewPage from "./pages/atencion-salud/ReviewPage";

// RH
import RHCampaignsPage from "./pages/rh/CampaignsPage";
import RHDashboardPage from "./pages/rh/DashboardPage";

// Coordinación Estatal
import CoordinacionProposalsPage from "./pages/coordinacion/ProposalsPage";

// Validador
import ValidadorValidationsPage from "./pages/validador/ValidationsPage";

// DG
import DGDashboardPage from "./pages/dg/DashboardPage";

import "./App.css";

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

      {/* Protected Routes - Home */}
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

      {/* Planeación Routes */}
      <Route
        path="/planeacion/campaigns"
        element={
          <ProtectedRoute allowedRoles={[ROLES.PLANEACION]}>
            <Layout>
              <PlaneacionCampaignsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/planeacion/campaigns/:id"
        element={
          <ProtectedRoute allowedRoles={[ROLES.PLANEACION]}>
            <Layout>
              <CampaignDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Atención a la Salud Routes */}
      <Route
        path="/atencion-salud/review"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ATENCION_SALUD]}>
            <Layout>
              <AtencionSaludReviewPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* RH Routes */}
      <Route
        path="/rh/campaigns"
        element={
          <ProtectedRoute allowedRoles={[ROLES.RH]}>
            <Layout>
              <RHCampaignsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rh/dashboard"
        element={
          <ProtectedRoute allowedRoles={[ROLES.RH]}>
            <Layout>
              <RHDashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Coordinación Estatal Routes */}
      <Route
        path="/coordinacion/proposals"
        element={
          <ProtectedRoute allowedRoles={[ROLES.COORD_ESTATAL]}>
            <Layout>
              <CoordinacionProposalsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Validador Routes */}
      <Route
        path="/validador/validations"
        element={
          <ProtectedRoute allowedRoles={[ROLES.VALIDADOR]}>
            <Layout>
              <ValidadorValidationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* DG Routes */}
      <Route
        path="/dg/dashboard"
        element={
          <ProtectedRoute allowedRoles={[ROLES.DG]}>
            <Layout>
              <DGDashboardPage />
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
