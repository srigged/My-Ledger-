import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'analyst' | 'viewer')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-bg" role="status" aria-label="Authenticating session">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" aria-hidden="true" />
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] animate-pulse">VERIFYING SECURITY PROTOCOLS...</p>
      </div>
    </div>
  );

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center bg-surface hairline-border">
        <div className="max-w-md">
          <h2 className="text-2xl font-serif text-accent mb-4 uppercase tracking-widest">Not Authorized</h2>
          <p className="text-muted font-mono text-sm leading-relaxed">
            Your current access level ({user.role.toUpperCase()}) does not permit viewing this secure data segment. 
            Contact system administrator for privilege escalation.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="mt-8 px-8 py-3 bg-accent text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all outline-none focus:ring-2 focus:ring-accent/20"
          >
            GO BACK
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
