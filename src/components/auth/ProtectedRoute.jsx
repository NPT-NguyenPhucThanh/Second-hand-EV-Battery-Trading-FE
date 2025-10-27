// src/components/auth/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const RoleGuard = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !user.isAuthenticated) {
    console.log("Redirecting to login: user is not authenticated", user);
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    console.log("Redirecting to unauthorized: role not allowed", user.role, allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleGuard;