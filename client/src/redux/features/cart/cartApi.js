import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../baseQueryWithReauth";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Cart"],
  
  endpoints: (builder) => ({
    addItemToCart: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: "/cart/add",
        method: "POST",
        body: { productId, quantity },
      }),
      invalidatesTags: ["Cart"],
    }),
    getCartItems: builder.query({
      query: () => ({
        url: "/cart/get",
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),
    updateCartItem: builder.mutation({
      query: ({ itemId, quantity }) => ({
        url: `/cart/update/${itemId}`,
        method: "PATCH",
        body: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),
    deleteCartItem: builder.mutation({
      query: (itemId) => ({
        url: `/cart/delete/${itemId}`,
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
