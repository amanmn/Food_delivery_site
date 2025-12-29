import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const itemApi = createApi({
  reducerPath: "itemApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/item",
    credentials: "include",
  }),
  tagTypes: ["Item"],
  endpoints: (builder) => ({
    // Get items by user's city
    getItemByCity: builder.query({
      query: (city) => `get-item-by-city/${city}`,
      providesTags: ["Item"],
    }),
  }),
});

export const { useGetItemByCityQuery } = itemApi;
