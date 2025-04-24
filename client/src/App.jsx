import { lazy, Suspense } from "react";  //lazy-loading for optimizing performance of the application
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtecteRoute from "./routes/ProtectedRoute";
import { userLoggedIn } from "./redux/features/auth/authSlice";
// import UserList from "./pages/UsersList";
// import { fetchUserProfile } from "./redux/slices/userSlice";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const Cart = lazy(() => import("./pages/Cart"));
const OrderForm = lazy(() => import("./pages/OrderForm"));


function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (user && token) {
      dispatch(userLoggedIn({ user, token }));
    }
  }, [dispatch]);
  
  return (<>
    <Router>
    <ToastContainer />
    <Suspense fallback={<div className="text-center mt-10 text-lg">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtecteRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<OrderForm />} />
        </Route>

        {/* <Route path="/users" element={<UserList />} />    */}
        <Route path='*' element={<Navigate to="/" />} />
      </Routes>
      </Suspense>
    </Router>
  </>
  );
}

export default App;
