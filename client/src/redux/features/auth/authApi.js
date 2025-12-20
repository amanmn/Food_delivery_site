import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BASEURL?.replace(/\/+$/, "") || "http://localhost:8000";
const AUTH_API = `${BASE_URL}/api/auth`;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: AUTH_API,
    credentials: "include",
  }),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (formData) => ({
        url: "register",
        method: "POST",
        body: formData
      }),
      invalidatesTags: [],
    }),
    loginUser: builder.mutation({
      query: (formData) => ({
        url: "login",
        method: "POST",
        body: formData
      }),
      invalidatesTags: ["Auth"],
    }),
    sendOtp: builder.mutation({
      query: ({ email }) => ({
        url: "send-otp",
        method: "POST",
        body: { email },
      }),
    }),
    verifyOtp: builder.mutation({
      query: ({ email, otp }) => ({
        url: "verify-otp",
        method: "POST",
        body: { email, otp },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ email, newPassword }) => ({
        url: "reset-password",
        method: "POST",
        body: { email, newPassword },
      }),
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    // ✅ fetch logged in user from backend
    loadUserData: builder.query({
      query: () => ({
        url: "me", // backend route: GET /api/auth/me
        method: "GET"
      }),
      transformResponse: (response) => response?.user ?? null,
      providesTags: ["Auth"],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useLogoutUserMutation,
  useLoadUserDataQuery, // ✅ fetch user on refresh
  // useUpdateUserDataMutation,
  // useUploadProfileImageMutation,
} = authApi;
