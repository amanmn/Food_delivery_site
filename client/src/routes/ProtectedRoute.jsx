import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  console.log("role", role);

  if (loading) {
    return <div className="text-center mt-10 text-lg">Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && !user) return <Navigate to="/login" replace />

  if (role && user?.role !== role) {
    console.log(user.role, role);
    const redirectPath = role === "owner" ? "/dash" : "/";
    return <Navigate to={redirectPath} replace />;
  }

  if (role && user?.role !== role) {
    console.log(user.role, role);
    const redirectPath = role === "" ? "/delivery" : "/";
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
