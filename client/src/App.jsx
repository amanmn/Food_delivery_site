import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import ProtectedRoute from "./routes/ProtectedRoute";
import { userLoggedIn } from "./redux/features/auth/authSlice";
import { useLoadUserQuery } from "./redux/features/user/userApi";
import './index.css'

import { updateUserProfile } from "./redux/features/user/userSlice";
// import AdminDashboard from "../admin/pages/AdminDashboard"

// Lazy-loaded pages

const HomePage = lazy(() => import("./pages/Home"));
const LoginPage = lazy(() => import("./pages/Login"));
const RegisterPage = lazy(() => import("./pages/Register"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const CartPage = lazy(() => import("./pages/Cart"));
const OrderPage = lazy(() => import("./pages/OrderForm"));
const MainDashboard = lazy(()=> import('../admin/pages/Dashboard'));
function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const {
    data: user,
    isSuccess,
    isLoading,
    isError
  } = useLoadUserQuery(undefined, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    // console.log("userLoading: ", isSuccess, user);
    if (isSuccess && user) {
      dispatch(userLoggedIn({ user })); // marks isAuthenticated: true
      dispatch(updateUserProfile(user)); // sets full profile in userSlice
    }
  }, [isSuccess, user, dispatch]);

  if (isLoading) {
    return <div className="text-center mt-10 text-lg">Loading user data...</div>;
  }

  return (
    <Router>
      <ToastContainer />
      <Suspense fallback={<div className="text-center mt-10 text-lg">Loading page...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dash" element={<MainDashboard />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order" element={<OrderPage />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
