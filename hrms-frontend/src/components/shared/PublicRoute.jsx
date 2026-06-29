import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/auth.store';

export default function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  // If user is authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    // Prefer role‑based dashboard when role is available
    if (user?.role) {
      switch (user.role) {
        case 'employee':
          return <Navigate to="/dashboard/employee" replace />;
        case 'manager':
          return <Navigate to="/dashboard/manager" replace />;
        case 'hr_admin':
          return <Navigate to="/dashboard/hr" replace />;
        case 'leadership':
          return <Navigate to="/dashboard/leadership" replace />;
        default:
          return <Navigate to="/dashboard" replace />;
      }
    }
    // Fallback when role is missing
    return <Navigate to="/dashboard" replace />;
  }

  // Not authenticated – render the public page (login / register)
  return children;
}
