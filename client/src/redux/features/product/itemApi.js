import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const ITEM_API = "http://localhost:8000/api/item";

export const itemApi = createApi({
  reducerPath: "itemApi",
  baseQuery: fetchBaseQuery({
    baseUrl: ITEM_API,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // ✅ Get items by user's city
    getItemByCity: builder.query({
      query: (city) => ({
        url: `get-item-by-city/${city}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetItemByCityQuery } = itemApi;
