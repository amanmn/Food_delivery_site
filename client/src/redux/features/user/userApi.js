import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASEURL
      ? `${import.meta.env.VITE_BASEURL.replace(/\/$/, "")}/user`
      : "/api/user",
    credentials: "include",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // user profile
    loadUser: builder.query({
      query: () => "/profile",
      transformResponse: (response) => response.user,
      providesTags: ["User"],
    }),

    // Update user info
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
        url: "/update-address",
        method: "PUT",
        body: addressData,
      }),
      invalidatesTags: ["User"],
    }),

    // Upload profile image
    uploadProfileImage: builder.mutation({
      query: (formData) => ({
        url: "/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),

    // Update delivery boy’s live location (admin or delivery role)
    updateDeliveryLocation: builder.mutation({
      query: (locationData) => ({
        url: "/update-location", // ✅ handled in backend for delivery boy
        method: "POST",
        body: locationData,
      }),
      invalidatesTags: ["User"],
    }),

    // Get all delivery boys
    getDeliveryBoys: builder.query({
      query: () => "/delivery-boys",
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
