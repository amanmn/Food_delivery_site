// 1. Updated `authApi.js` to include `uploadProfileImage`

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$|^\/+/g, "") || "http://localhost:8000";
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
    }),
    loginUser: builder.mutation({
      query: (formData) => ({
        url: "login",
        method: "POST",
        body: formData
      }),
      invalidatesTags: ["Auth"],
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  // useUpdateUserDataMutation,
  // useUploadProfileImageMutation,
  // useLoadUserQuery,
} = authApi;
