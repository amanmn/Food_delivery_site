import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, authChecked } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.user);

  if (!authChecked) return null; // wait for AuthProvider to finish

  if (!isAuthenticated || !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
