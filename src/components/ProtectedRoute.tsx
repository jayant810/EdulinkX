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
  const { isAuthenticated, user } = useAuth();

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
