import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../baseQueryWithReauth";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,

  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (formData) => ({
        url: "register",
        method: "/auth/POST",
        body: formData
      }),
      invalidatesTags: [],
    }),
    loginUser: builder.mutation({
      query: (formData) => ({
        url: "/auth/login",
        method: "POST",
        body: formData
      }),
      invalidatesTags: ["Auth"],
    }),
    sendOtp: builder.mutation({
      query: ({ email }) => ({
        url: "/auth/send-otp",
        method: "POST",
        body: { email },
      }),
    }),
    verifyOtp: builder.mutation({
      query: ({ email, otp }) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: { email, otp },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ email, newPassword }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: { email, newPassword },
      }),
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    // fetch logged in user from backend
    getMe: builder.query({
      query: () => "auth/me",
      transformResponse: (response) => response?.user ?? null,
      providesTags: ["Auth"],
      // keep the user cached for 5 minutes to avoid refetch on quick remounts/navigation
      keepUnusedDataFor: 300,
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
  useGetMeQuery, // ✅ fetch user on refresh
  // useUpdateUserDataMutation,
  // useUploadProfileImageMutation,
} = authApi;
