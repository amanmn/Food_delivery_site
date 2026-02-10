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
    getItemByCity: builder.query({
      query: (city) => `/get-item-by-city/${city}`,
      providesTags: ["Item"],
    }),
    getItemsByShop: builder.query({
      query: (shopId) => `/get-item-by-shop/${shopId}`,
      providesTags: ["Item"],
    }),
    searchItems: builder.query({
      query: ({ query, city }) => ({
        url: "/search-items",
        params: { query, city },
      }),
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useGetItemByCityQuery,
  useGetItemsByShopQuery,
  useSearchItemsQuery,
} = itemApi;
