import React, { useState, useEffect } from 'react';
import { IoIosArrowRoundBack } from "react-icons/io";
import { data, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation, useSendOtpMutation, useVerifyOtpMutation } from '../redux/features/auth/authApi';
import { toast } from 'react-toastify';
import { MdPassword } from 'react-icons/md';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setErr("");
    setPassword(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };


  const [sendOtp, {
    data: OtpSend,
    error: otpSendError,
    isLoading: otpSendIsLoading,
    isSuccess: otpSendIsSuccess
  }] = useSendOtpMutation();

  const [verifyOtp, {
    data: verify,
    error: verificationError,
    isLoading: verificationIsLoading,
    isSuccess: verificationIsSuccess
  }] = useVerifyOtpMutation();

  const [resetPassword, {
    data: reset,
    error: resetPasswordError,
    isLoading: resetPasswordIsLoading,
    isSuccess: resetPasswordIsSuccess,
  }] = useResetPasswordMutation();

  useEffect(() => {
    if (step === 1) {
      if (otpSendError) {
        setErr(otpSendError?.data?.message);
        toast.error(otpSendError?.data?.message || "request rejected");
      }
      if (otpSendIsSuccess) {
        setErr("");
        toast.success(sendOtp?.message || "Otp Sent")
        setStep(2);
      }
    }

    if (step === 2) {
      if (verificationError) {
        setErr(verificationError?.data?.message);
        toast.error(verificationError?.data?.message || "verification rejected");
      }
      if (verificationIsSuccess) {
        setErr("");
        toast.success(verificationIsSuccess?.message || "Verification successful")
        setStep(3);
      }
    }

    if (step === 3) {
      if (resetPasswordError) {
        setErr(resetPasswordError?.data?.message)
        toast.error(resetPasswordError?.data?.message || "verification rejected");
        navigate("/forgot-password");
      }
      if (resetPasswordIsSuccess) {
        setErr("");
        toast.success(resetPasswordIsSuccess?.data.message || "Verification successful")
        navigate("/login");
      }
    }

  }, [otpSendError, otpSendIsSuccess, verificationError, verificationIsSuccess, resetPasswordError, resetPasswordIsSuccess])


  const handleSendOtp = async (e) => {
    e.preventDefault();
    await sendOtp({ email });
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    await verifyOtp({ email, otp });
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password.newPassword || !password.confirmPassword) {
      setErr("Both password fields are required")
      toast.error("Both password fields are required");
      return;
    }

    if (password.newPassword.length < 6) {
      setErr("Password must be at least 6 characters long")
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password.newPassword !== password.confirmPassword) {
      setErr("Passwords do not match")
      toast.error("Passwords do not match");
      return;
    }

    try {
      await resetPassword({ email, newPassword: password.newPassword });
      navigate("/login")
    } catch (error) {
      setErr(error.response?.data?.message);
    }
  }

  return (
    <div className='flex w-full items-center justify-center min-h-screen p-4 bg-pink-50'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-md p-8'>
        <div className='flex items-center gap-5 mb-4'>
          <IoIosArrowRoundBack onClick={() => navigate("/login")} size={35} className='text-red-500 cursor-pointer mt-1' />
          <h1 className='text-2xl font-bold text-center text-red-500'>Forgot Password</h1>
        </div>
        {step == 1
          &&
          <div>
            <div className='mb-3'>
              <label htmlFor="email" className="block text-gray-600 text-base font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-1"
                placeholder="Enter your email"
                required
              />
            </div>

            {err &&
              <p className="text-red-500 text-center mb-4" role="alert">{err}</p>
            }

            <button
              onClick={handleSendOtp}
              className={`w-full text-white cursor-pointer text-lg font-semibold py-3 transition-color duration-200 rounded-lg transition bg-red-500 hover:bg-red-600
                `}
            >
              Send Otp
            </button>

          </div>
        }

        {step == 2
          &&
          <div>
            <div className='mb-3'>
              <label htmlFor="email" className="block text-gray-600 text-base font-medium mb-2">OTP</label>
              <input
                name='otp'
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-1"
                placeholder="Enter OTP"
                required
              />
            </div>

            {err &&
              <p className="text-red-500 text-center mb-4" role="alert">{err}</p>
            }

            <button
              type='button'
              onClick={handleVerifyOtp}
              className={`w-full text-white cursor-pointer text-lg font-semibold py-3 transition-color duration-200 rounded-lg transition bg-red-500 hover:bg-red-600"
                }`}
            >
              Verify
            </button>

          </div>
        }

        {step == 3
          &&
          <div>
            <div className='mb-3'>
              <label htmlFor="newPassword" className="block text-gray-600 text-base font-medium mb-2">New Password</label>
              <input
                name="newPassword"
                type="password"
                value={password.newPassword}
                onChange={handleChange}
                className="w-full p-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                placeholder="Enter New Password"
                required
              />
            </div>

            <div className='mb-3'>
              <label htmlFor="ConfirmPassword" className="block text-gray-600 text-base font-medium mb-2">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                value={password.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-1"
                placeholder="Confirm Password"
                required
              />
            </div>

            {err &&
              <p className="text-red-500 text-center mb-4" role="alert">{err}</p>
            }

            <button
              onClick={handleResetPassword}
              className={`w-full text-white cursor-pointer text-lg font-semibold py-3 transition-color duration-200 rounded-lg transition bg-red-500 hover:bg-red-600"
                }`}
            >
              Reset Password
            </button>

          </div>
        }
      </div>
    </div>
  )
}

export default ForgotPassword
