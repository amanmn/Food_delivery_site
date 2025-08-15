import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useRegisterUserMutation } from "../redux/features/auth/authApi";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
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
    await registerUser(formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-pink-50 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-700 text-center mb-6">Create an Account</h2>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-gray-600 text-base font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 text-base font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
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
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Create a password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={registerIsLoading} 
            className={`w-full text-white cursor-pointer text-lg font-semibold py-3 rounded-lg transition ${registerIsLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
              }`}
          >
            {registerIsLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-gray-600 text-base text-center mt-5">
          Already have an account?
          <span
            className="text-red-500 font-medium cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            {" "}Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
