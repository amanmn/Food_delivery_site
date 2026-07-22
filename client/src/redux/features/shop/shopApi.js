import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../baseQueryWithReauth";

export const shopApi = createApi({
  reducerPath: "shopApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Shop", "Dashboard"],

  endpoints: (builder) => ({
    // Get shops by city (publicApi)
    getShopByCity: builder.query({
      query: (city) => `/shop/get-shop-by-city/${city}`,
      providesTags: ["Shop"],
    }),

    // Get logged-in owner's shop
    getMyShop: builder.query({
      query: () => "/shop/get-myshop",
      providesTags: ["Shop"],
    }),

    deleteShop: builder.mutation({
      query: () => ({
        url: "/shop/delete-shop",
        method: "DELETE"
      }),
      invalidatesTags: ["Shop"]
    }),

    // Create or edit shop
    createOrEditShop: builder.mutation({
      query: (formData) => ({
        url: "/shop/create-edit",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Shop"],
    }),
    getDashboardStats: builder.query({
      query: () => ({
        url: "/shop/dashboard",
        method: "GET",
      }),
      providesTags: ["Shop"],
    }),

  }),
});

export const {
  useGetShopByCityQuery,
  useGetMyShopQuery,
  useDeleteShopMutation,
  useCreateOrEditShopMutation,
  useGetDashboardStatsQuery,
} = shopApi;
