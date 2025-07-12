// 1. Updated `authApi.js` to include `uploadProfileImage`

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$|^\/+/g, "") || "http://localhost:8000";
const USER_API = `${BASE_URL}/user`;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (formData) => ({ url: "register", method: "POST", body: formData }),
    }),
    loginUser: builder.mutation({
      query: (formData) => ({ url: "login", method: "POST", body: formData }),
      invalidatesTags: ["User"],
    }),
    logoutUser: builder.mutation({
      query: () => ({ url: "logout", method: "POST" }),
      invalidatesTags: ["User"],
    }),
    updateUserData: builder.mutation({
      query: (updatedData) => ({ url: "update", method: "PUT", body: updatedData }),
      invalidatesTags: ["User"],
    }),
    uploadProfileImage: builder.mutation({
      query: (formData) => ({
        url: "upload",
        method: "POST",
        body: formData,
      }),
    }),
    loadUser: builder.query({
      query: () => ({ url: "profile", method: "GET" }),
      transformResponse: (response) => response.user,
      providesTags: ["User"],
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useUpdateUserDataMutation,
  useUploadProfileImageMutation,
  useLoadUserQuery,
} = authApi;
