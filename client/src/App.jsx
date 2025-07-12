import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import ProtectedRoute from "./routes/ProtectedRoute";
import { userLoggedIn } from "./redux/features/auth/authSlice";
import { useLoadUserQuery } from "./redux/features/auth/authApi";

// Lazy-loaded pages
const HomePage = lazy(() => import("./pages/Home"));
const LoginPage = lazy(() => import("./pages/Login"));
const RegisterPage = lazy(() => import("./pages/Register"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const CartPage = lazy(() => import("./pages/Cart"));
const OrderPage = lazy(() => import("./pages/OrderForm"));

function App() {
  const dispatch = useDispatch();
  const {
    data: user,
    isSuccess,
    isLoading,
  } = useLoadUserQuery();

  useEffect(() => {
    if (isSuccess && user) {
      dispatch(userLoggedIn({ user }));
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
