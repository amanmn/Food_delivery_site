import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
import { useLoginUserMutation } from "../redux/features/auth/authApi";
import { userLoggedIn } from "../redux/features/auth/authSlice";
import { useDispatch } from "react-redux";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loginUser, {
    isLoading,
    isSuccess,
    isError
  }] = useLoginUserMutation();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError("");

    try {
      const response = await loginUser(formData).unwrap();
      dispatch(userLoggedIn(response.user));

      const role = response?.user?.role;
      console.log(role);
      toast.success("Login successful");

      if (role === "owner") {
        navigate("/dash", { replace: true });
      } else if (role === "deliveryBoy") {
        navigate("/delivery", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      const message = error?.data?.message || error?.message || "Login failed";
      setApiError(message);
      toast.error(message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `/api/auth/google`;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-pink-50 p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-4xl text-left font-bold text-red-500 mb-2">
          Fudo
        </h2>
        <p className="text-xl text-gray-600 mb-8">Login to get started with delicious food deliveries</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-600 text-base font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-600 text-base font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter your password"
                required
              />
              <span
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  fontSize: '1.2rem',
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: "#4a5565"
                }}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className=" float-right text-red-500 cursor-pointer text-base font-medium mb-4"
          >
            forgot password
          </button>

          <button
            type="submit"
            className="w-full bg-red-500 cursor-pointer text-white text-lg font-semibold py-3 rounded-lg hover:bg-red-600 transition"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          {apiError && (
            <p className="text-red-500 text-center my-[px]">{apiError}</p>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full mt-2 flex justify-center items-center text-gray-700 gap-2 px-4 py-2 transition duration-200 border rounded-lg focus:outline-none border-gray-400 hover:bg-gray-100 cursor-pointer">
            <FcGoogle size={22} />
            <span>Login with Google</span>
          </button>
        </form>

        <p className="text-gray-600 text-base text-center mt-4">
          Don't have an account?
          <button
            className="text-red-500 font-medium cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            {" "}Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
