import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, hasAnyRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
          <p className="font-body text-slate-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, check if user has any of them
  if (allowedRoles && allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
