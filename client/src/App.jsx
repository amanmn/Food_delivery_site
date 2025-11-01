import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";

import ProtectedRoute from "./routes/ProtectedRoute";
import { userLoggedIn, userLoggedOut } from "./redux/features/auth/authSlice";
import { useLoadUserQuery } from "./redux/features/user/userApi";
import { useLoadUserDataQuery } from "./redux/features/auth/authApi";
import { ColorRing } from 'react-loader-spinner'
import './index.css';
import { updateUserProfile } from "./redux/features/user/userSlice";
import CreateEditShop from "../admin/pages/CreateEditShop";
import MyShop from "../admin/pages/MyShop";
import AddFoodItem from "../admin/pages/AddFoodItem";
import ItemProduct from "../admin/pages/ItemProduct";
import EditItem from "../admin/pages/EditItem";
// import AdminDashboard from "../admin/pages/AdminDashboard";
// Lazy-loaded pages

const HomePage = lazy(() => import("./pages/Home"));
const LoginPage = lazy(() => import("./pages/Login"));
const RegisterPage = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const CartPage = lazy(() => import("./pages/Cart"));
const OrderPage = lazy(() => import("./pages/OrderForm"));
const OwnerDashboard = lazy(() => import('../admin/pages/Dashboard'));
const Settings = lazy(() => import('../admin/pages/Settings'));
const DeliveryDashboard = lazy(() => import('../deliveryboy/Deliverydashboard'))

function App() {
  const dispatch = useDispatch();
  const {
    data: userData,
    isSuccess,
    isLoading,
    isError,
    error,
  } = useLoadUserDataQuery(undefined, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (isSuccess && userData) {
      dispatch(userLoggedIn({ user: userData }));
      dispatch(updateUserProfile(userData)); // sets full profile in userSlice
      console.log("userLoading: ", isSuccess, userData);
    } else if (isError) {
      dispatch(userLoggedOut());
      console.error("Error loading user:", error);
    }
    return;

  }, [isSuccess, userData, isError, error, dispatch]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ColorRing
          visible={true}
          height="100"
          width="100"
          ariaLabel="color-ring-loading"
          colors={['red', '#f47e60', '#f8b26a', 'red', '#849b87']}
        />
      </div>
    )
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

          {/* Restrict / for roles */}
          <Route
            path="/"
            element={
              userData?.role === "owner" ? (
                <Navigate to="/dash" replace />
              ) : userData?.role === "deliveryboy" ? (
                <Navigate to="/delivery" replace />
              ) : (
                <HomePage />
              )
            }
          />

          {/* Protected Routes (User) */}
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            {/* <Route path="/" element={<HomePage />} /> */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order" element={<OrderPage />} />
          </Route>

          {/* Owner Routes */}
          <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
            <Route path="/dash" element={<OwnerDashboard />} />
            <Route path="/create-edit-shop" element={<CreateEditShop />} />
            <Route path="/add-food-item" element={<AddFoodItem />} />
            <Route path="/my-shop" element={<MyShop />} />
            <Route path="/item-product" element={<ItemProduct />} />
            <Route path="/edit-item/:itemId" element={<EditItem />} />
            <Route path='/settings' element={<Settings />} />
          </Route>

          {/* DeliveryBoy Routes */}
          <Route element={<ProtectedRoute allowedRoles={["deliveryBoy"]} />}>
            <Route path="/delivery" element={<DeliveryDashboard />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
