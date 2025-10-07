import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useRegisterUserMutation } from "../redux/features/auth/authApi";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: role,
  });

  const [registerUser, {
    data: registerData,
    error: registerError,
    isLoading: registerIsLoading,
    isSuccess: registerIsSuccess
  }] = useRegisterUserMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (registerError) {
      toast.error(registerError?.data?.message || "Signup Failed");
    }
    if (registerIsSuccess) {
      toast.success(registerData?.message || "Registration Successful");
      navigate("/login");
    }

  }, [registerIsSuccess, registerIsLoading, registerError]);

  const handleRegister = async (e) => {
    e.preventDefault();
    await registerUser({ ...formData, role });
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google";
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-pink-50 p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-700 text-center mb-2">Create an Account</h2>

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label htmlFor="name" className="block text-gray-600 text-base font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-600 text-base font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="mobile" className="block text-gray-600 text-base font-medium mb-1">Mobile</label>
            <input
              type="number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your Mobile Number"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 text-base font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Create a password"
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

          <div>
            <label htmlFor="role" className="block text-gray-600 text-base font-medium mb-1">Role</label>
            <div className="flex  gap-2 ">
              {["user", "owner", "deliveryBoy"].map((r) => (
                <button
                  className="flex-1 bg-white text-gray-700 cursor-pointer hover:outline-none rounded-lg px-3 py-2 text-center font-medium transition-colors"
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  style={
                    role === r ?
                      { backgroundColor: "#fb2c36", color: "white" }
                      : { color: "#fb2c36" }
                  }
                >{r}</button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={registerIsLoading}
            className={`w-full text-white cursor-pointer text-lg font-semibold py-2 transition-color duration-200 rounded-lg transition ${registerIsLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
              }`}
          >
            {registerIsLoading ? "Signing up..." : "Sign Up"}
          </button>
          <button
            onClick={handleGoogleLogin}
            className="w-full mt-2 flex justify-center items-center text-gray-700 gap-2 border rounded-lg focus:outline-none px-4 py-1 transition duration-200 border-gray-400 hover:bg-gray-100 cursor-pointer">
            <FcGoogle size={22} />
            <span>Sign up with Google</span>
          </button>
        </form>

        <p className="text-gray-600 text-base text-center mt-4">
          Already have an account?
          <span
            className="text-red-500 font-medium cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            {" "}Login
          </span>
        </p>
      </div >
    </div >
  );
};

export default Register;
