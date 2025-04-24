import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CART_API = "http://localhost:8000/cart";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({
    baseUrl: CART_API,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    addItemToCart: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: "add",
        method: "POST",
        body: { productId, quantity },
      }),
    }),
    getCartItems: builder.query({
        query: () => ({
          url: "get",
          method: "GET",
        }),
      }),
  }),
});

export const { useAddItemToCartMutation, useGetCartItemsQuery } = cartApi;
