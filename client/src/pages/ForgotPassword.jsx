import React from 'react'
import { useState } from 'react';
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';


const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

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
            <div className='mb-6'>
              <label htmlFor="email" className="block text-gray-600 text-base font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              className={`w-full text-white cursor-pointer text-lg font-semibold py-3 transition-color duration-200 rounded-lg transition bg-red-500 hover:bg-red-600"
                }`}
            >
              Send Otp
            </button>
          </div>
        }

        {step == 2
          &&
          <div>
            <div className='mb-6'>
              <label htmlFor="email" className="block text-gray-600 text-base font-medium mb-2">OTP</label>
              <input
                type="email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                placeholder="Enter OTP"
                required
              />
            </div>
            <button
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
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                placeholder="Enter New Password"
                required
              />
            </div>

            <div className='mb-6'>
              <label htmlFor="ConfirmPassword" className="block text-gray-600 text-base font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                placeholder="Confirm Password"
                required
              />
            </div>
            <button
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
