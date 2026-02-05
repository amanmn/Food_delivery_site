import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, authChecked } = useSelector((state) => state.auth);

  console.log("ProtectedRoute:", {
    user,
    isAuthenticated,
    authChecked
  });

  if (!authChecked) return null; // wait for AuthProvider to finish

  if (!isAuthenticated || !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
