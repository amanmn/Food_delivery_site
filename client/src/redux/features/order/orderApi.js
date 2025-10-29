import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const ORDER_API = "http://localhost:8000/api/order";

export const orderApi = createApi({
    reducerPath: "orderApi",
    baseQuery: fetchBaseQuery({
        baseUrl: ORDER_API,
        credentials: 'include',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),

    tagTypes: ["Cart", "Orders", "User"],
    endpoints: (builder) => ({
        placeOrder: builder.mutation({
            query: (orderData) => ({
                url: "place-order",               //     /api/order/place-order
                method: "POST",
                body: orderData,
            }),
            invalidatesTags: ["Cart", "Orders", "User"], // ensure state refetch
        }),
        getOrderItems: builder.query({
            query: () => ({
                url: "orders",        //     /api/order/orders
                method: "GET"
            }),
            providesTags: ["Orders"],
        }),
    })
})

export const { usePlaceOrderMutation, useGetOrderItemsQuery } = orderApi;
