import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div className="text-center mt-10 text-lg">Checking authentication...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // if route requires specific roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // redirect based on role
    if (user.role === "owner") return <Navigate to="/dash" replace />;
    if (user.role === "deliveryBoy") return <Navigate to="/delivery" replace />;
    if (user.role === "user") return <Navigate to="/" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
