// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

type ProtectedRouteProps = {
  children: JSX.Element;
  allowedRoles?: Array<string>;
  redirectTo?: string;
};

/**
 * Usage:
 * <ProtectedRoute allowedRoles={['student']}> <StudentDashboard /> </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = "/login",
}) => {
  const { isAuthenticated, user, authLoading } = useAuth();

  // ✅ Wait for AuthProvider to load from localStorage before deciding
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // If user role is missing or not allowed, redirect to login or 403 page
    if (!user || !allowedRoles.includes(user.role)) {
      // You can create a 403 page and redirect there instead
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
};
