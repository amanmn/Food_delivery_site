import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const shopApi = createApi({
  reducerPath: "shopApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASEURL
      ? `${import.meta.env.VITE_BASEURL.replace(/\/$/, "")}/shop`
      : "/api/shop",
    credentials: "include",
  }),
  tagTypes: ["Shop"],
  endpoints: (builder) => ({
    // Get shops by city (public)
    getShopByCity: builder.query({
      query: (city) => `get-shop-by-city/${city}`,
      providesTags: ["Shop"],
    }),

    // Get logged-in owner's shop
    getMyShop: builder.query({
      query: () => "get-myshop",
      providesTags: ["Shop"],
    }),

    // Create or edit shop
    createOrEditShop: builder.mutation({
      query: (formData) => ({
        url: "create-edit",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Shop"],
    }),
  }),
});

export const {
  useGetShopByCityQuery,
  useGetMyShopQuery,
  useCreateOrEditShopMutation,
} = shopApi;
