import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const itemApi = createApi({
  reducerPath: "itemApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASEURL
      ? `${import.meta.env.VITE_BASEURL.replace(/\/$/, "")}/item`
      : "/api/item",
    credentials: "include",
  }),
  tagTypes: ["Item"],
  endpoints: (builder) => ({
    // Get items by user's city
    getItemByCity: builder.query({
      query: (city) => `get-item-by-city/${city}`,
      providesTags: ["Item"],
    }),
    getItemsByShop: builder.query({
      query: (shopId) => `get-item-by-shop/${shopId}`,
      providesTags: ["Item"],
    })
  }),
});

export const {
  useGetItemByCityQuery,
  useGetItemsByShopQuery
} = itemApi;
