import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { useGetMeQuery } from "./redux/features/auth/authApi";
import { userLoggedIn, userLoggedOut } from "./redux/features/auth/authSlice";
import { ColorRing } from 'react-loader-spinner';
import './index.css';

import ProtectedRoute from "./routes/ProtectedRoute";
import { useUpdateDeliveryLocationMutation } from "./redux/features/user/userApi";

// import { userLoggedIn, userLoggedOut } from "./redux/features/auth/authSlice";
// import { useLoadUserDataQuery } from "./redux/features/auth/authApi";
// import { updateUserProfile } from "./redux/features/user/userSlice";

import CreateEditShop from "../admin/pages/CreateEditShop";
import MyShop from "../admin/pages/MyShop";
import AddFoodItem from "../admin/pages/AddFoodItem";
import ItemProduct from "../admin/pages/ItemProduct";
import EditItem from "../admin/pages/EditItem";
import Settings from "../admin/pages/Settings";

import useDetectLocation from "./hooks/useDetectLocation";
import useDeliveryBoyTracker from "./hooks/useDeliveryBoyTracker";
import TrackOrderPage from "./pages/TrackOrderPage";

// Lazy pages
const HomePage = lazy(() => import("./pages/Home"));
const LoginPage = lazy(() => import("./pages/Login"));
const RegisterPage = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const CartPage = lazy(() => import("./pages/Cart"));
const OrderPage = lazy(() => import("./pages/MyOrders"));
const OwnerDashboard = lazy(() => import('../admin/pages/Dashboard'));
const DeliveryDashboard = lazy(() => import('../deliveryboy/Deliverydashboard'));
const Checkout = lazy(() => import("./pages/Checkout"));

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // const [setDeliveryLocation] = useUpdateDeliveryLocationMutation();

  const {
    data,
    isSuccess,
    isError,
    // isLoading,
    // error,
  } = useGetMeQuery();

  const [updateDeliveryLocation] = useUpdateDeliveryLocationMutation();

  // Load logged in user
  useEffect(() => {
    if (isSuccess && data) {
      dispatch(userLoggedIn({ user: data }));
      console.log("User loaded successfully:", data);
    }
    if (isError) {
      dispatch(userLoggedOut());
      console.error("Error loading user:", isError);
    }
  }, [isSuccess, isError]);

  // Hooks for user and shop data
  useDetectLocation();
  useDeliveryBoyTracker(user?.role, updateDeliveryLocation);

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ColorRing
          visible={true}
          height="100"
          width="100"
          ariaLabel="auth-loading"
          colors={['red', '#f47e60', '#f8b26a', 'red', '#849b87']}
        />
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen">
            <ColorRing
              visible={true}
              height="100"
              width="100"
              ariaLabel="color-ring-loading"
              colors={['red', '#f47e60', '#f8b26a', 'red', '#849b87']}
            />
          </div>
        }
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* 🎯 Root Redirect */}
          <Route
            path="/"
            element={
              isAuthenticated && user?.role === "owner" ? (
                <Navigate to="/dash" replace />
              ) : isAuthenticated && user?.role === "deliveryBoy" ? (
                <Navigate to="/delivery" replace />
              ) : (
                <HomePage />
              )
            }
          />

          {/* User routes */}
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/track-order/:orderId" element={<TrackOrderPage />} />
          </Route>

          {/* Owner routes */}
          <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
            <Route path="/dash" element={<OwnerDashboard />} />
            <Route path="/create-edit-shop" element={<CreateEditShop />} />
            <Route path="/add-food-item" element={<AddFoodItem />} />
            <Route path="/my-shop" element={<MyShop />} />
            <Route path="/item-product" element={<ItemProduct />} />
            <Route path="/edit-item/:itemId" element={<EditItem />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/orders" element={<OrderPage />} />
          </Route>

          {/* Delivery boy route */}
          <Route element={<ProtectedRoute allowedRoles={["deliveryBoy"]} />}>
            <Route path="/delivery" element={<DeliveryDashboard deliveryBoy={user} />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
