import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASEURL
      ? `${import.meta.env.VITE_BASEURL.replace(/\/$/, "")}/auth`
      : "/api/auth",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.user?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    }
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
    getMe: builder.query({
      query: () => "me",
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
