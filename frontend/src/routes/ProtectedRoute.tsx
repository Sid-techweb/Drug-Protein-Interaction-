import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex flex-col items-center justify-center p-6 space-y-4 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-purple-200 dark:border-sky-500/20 border-t-purple-600 dark:border-t-sky-500 rounded-full animate-spin" />
        <p className="text-xs font-mono text-purple-600 dark:text-sky-400">Verifying Researcher JWT Security Credentials...</p>
      </div>
    );
  }

  // Redirect to login page if token is missing or invalid
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
