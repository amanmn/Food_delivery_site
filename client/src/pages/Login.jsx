import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { userLoggedIn } from "../redux/features/auth/authSlice";
import { useLoginUserMutation } from "../redux/features/auth/authApi";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loginUser, {
    data: loginData,
    error: loginError,
    isLoading: loginIsLoading,
    isSuccess: loginIsSuccess,
  }] = useLoginUserMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await loginUser(formData);
  };

  useEffect(() => {
    if (loginError) {
      toast.error(loginError?.data?.message || "Login failed");
    }

    if (loginIsSuccess && loginData?.user) {
      toast.success("Login successful");

      // ✅ No localStorage or token management
      dispatch(userLoggedIn({ user: loginData.user }));

      // ✅ Navigate after login
      navigate("/");
    }
  }, [loginIsSuccess, loginError, loginData, dispatch, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-pink-50 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-700 text-center mb-6">Login to Fudo</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-600 text-base font-medium mb-1">Email</label>
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
            <label className="block text-gray-600 text-base font-medium mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 text-white text-lg font-semibold py-3 rounded-lg hover:bg-red-600 transition"
            disabled={loginIsLoading}
          >
            {loginIsLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-gray-600 text-base text-center mt-5">
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
