import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
import { useLoginUserMutation } from "../redux/features/auth/authApi";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loginUser, { isLoading }] = useLoginUserMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser(formData).unwrap();
      toast.success("Login successful");
      navigate("/"); // App.jsx + ProtectedRoute will handle auth + role
    } catch (err) {
      toast.error(err?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-pink-50 p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-4xl text-left font-bold text-red-500 mb-2">
          Fudo
        </h2>
        <p className="text-xl text-gray-600 mb-8">Login to get started with delicious food deliveries</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-600 text-base font-medium mb-1">
              Email
            </label>
            <input
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
            <label className="block text-gray-600 text-base font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter your password"
                required
              />
              <span
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

          <div type="button" onClick={() => navigate("/forgot-password")} className="text-right text-red-500 cursor-pointer text-base font-medium mb-4">
            forgot password
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 cursor-pointer text-white text-lg font-semibold py-3 rounded-lg hover:bg-red-600 transition"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <button className="w-full mt-2 flex justify-center items-center text-gray-700 gap-2 px-4 py-2 transition duration-200 border rounded-lg focus:outline-none border-gray-400 hover:bg-gray-100 cursor-pointer">
            <FcGoogle size={22} />
            <span>Login with Google</span>
          </button>
        </form>

        <p className="text-gray-600 text-base text-center mt-4">
          Don't have an account?
          <span
            className="text-red-500 font-medium cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            {" "}Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
