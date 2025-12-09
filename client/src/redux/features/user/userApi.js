import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const USER_API = "http://localhost:8000/api/user";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // user profile
    loadUser: builder.query({
      query: () => ({
        url: "/profile", // ✅ always start with /
        method: "GET",
      }),
      transformResponse: (response) => response.user,
      providesTags: ["User"],
    }),

    // 🔹 Update user basic info
    updateUserData: builder.mutation({
      query: (formData) => ({
        url: "/update",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),

    updateUserAddress: builder.mutation({
      query: (addressData) => ({
        url: "/update-address", // ✅ better to have a separate endpoint for clarity
        method: "PUT",
        body: addressData,
      }),
      invalidatesTags: ["User"],
    }),

    // 🔹 Upload profile image
    uploadProfileImage: builder.mutation({
      query: (formData) => ({
        url: "/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),

    // 🔹 Update delivery boy’s live location (admin or delivery role)
    updateDeliveryLocation: builder.mutation({
      query: (locationData) => ({
        url: "/update-location", // ✅ handled in backend for delivery boy
        method: "POST",
        body: locationData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["User"],
    }),

    // 🔹 Get all delivery boys
    getDeliveryBoys: builder.query({
      query: () => ({ url: "/delivery-boys", method: "GET" }),
      transformResponse: (res) => res.boys,
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoadUserQuery,
  useUpdateUserDataMutation,
  useUpdateUserAddressMutation,
  useUploadProfileImageMutation,
  useUpdateDeliveryLocationMutation,
  useGetDeliveryBoysQuery,
} = userApi;
