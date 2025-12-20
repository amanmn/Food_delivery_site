import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BASEURL || "http://localhost:8000";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/cart`,
    credentials: "include", // <-- Important: sends HTTP-only cookies
  }),
  endpoints: (builder) => ({
    addItemToCart: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: "add",
        method: "POST",
        body: { productId, quantity },
      }),
      invalidatesTags: ["Cart"],
    }),
    getCartItems: builder.query({
      query: () => ({
        url: "get",
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),
    updateCartItem: builder.mutation({
      query: ({ itemId, quantity }) => ({
        url: `update/${itemId}`,
        method: "PATCH",
        body: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),
    deleteCartItem: builder.mutation({
      query: (itemId) => ({
        url: `delete/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useAddItemToCartMutation,
  useGetCartItemsQuery,
  useUpdateCartItemMutation,
  useDeleteCartItemMutation,
} = cartApi;
