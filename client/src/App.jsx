import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { ColorRing } from 'react-loader-spinner';
import './index.css';
import { io } from "socket.io-client";

import ProtectedRoute from "./routes/ProtectedRoute";
import { useUpdateDeliveryLocationMutation } from "./redux/features/user/userApi";

import { useGetMeQuery } from "./redux/features/auth/authApi";
import { userLoggedIn, userLoggedOut } from "./redux/features/auth/authSlice";
import { useLoadUserQuery } from "./redux/features/user/userApi";
import { updateUserProfile } from "./redux/features/user/userSlice";

import CreateEditShop from "../admin/pages/CreateEditShop";
import MyShop from "../admin/pages/MyShop";
import AddFoodItem from "../admin/pages/AddFoodItem";
import ItemProduct from "../admin/pages/ItemProduct";
import EditItem from "../admin/pages/EditItem";
import OwnerOrders from "../admin/pages/OwnerOrders";
import Settings from "../admin/pages/Settings";

import useDetectLocation from "./hooks/useDetectLocation";
import useDeliveryBoyTracker from "./hooks/useDeliveryBoyTracker";
import TrackOrderPage from "./pages/TrackOrderPage";
import ShopItems from "./pages/ShopItems";
import { setSocket } from "./redux/features/user/userSlice";
import { socket } from "./socket";

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
  const navigate = useNavigate();
  const { data, isSuccess, isError, isLoading } = useGetMeQuery();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(userLoggedIn(data));

    } else if (isError) {
      dispatch(userLoggedOut());
      navigate("/");
    }
  }, [isSuccess, isError, data, dispatch]);

  const [updateDeliveryLocation] = useUpdateDeliveryLocationMutation();

  useDetectLocation();
  useDeliveryBoyTracker(user?.role, updateDeliveryLocation);

  useEffect(() => {
    console.log("App component :", {
      data,
      isAuthenticated
    });
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    if (user?._id) {
      socket.emit("joinRoom", { userId: user._id });
      dispatch(setSocket(socket));
      console.log("Joined room:", user._id);
    }
  }, [user?._id]);

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
          <Route path="/shop/:shopId" element={<ShopItems />} />

          {/* 🎯 Root Redirect */}
          <Route
            path="/"
            element={
              !isAuthenticated || !user ? (
                <HomePage />
              ) : user?.role === "owner" ? (
                <Navigate to="/dash" replace />
              ) : user?.role === "deliveryBoy" ? (
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
            <Route path="/orders" element={<OwnerOrders />} />
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
