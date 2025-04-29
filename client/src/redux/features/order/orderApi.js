import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import { placeOrder } from "../../../../../server/controllers/orderController";

const ORDER_API = "http://localhost:8000/order";

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
    endpoints: (builder) => ({
        placeOrder: builder.mutation({
            query: (orderData) => ({
                url: "place",
                method: "POST",
                body: orderData,
            }),
        }),
        getOrderItems: builder.query({
            query: () => "get",
        }),
    })
})

export const { usePlaceOrderMutation, useGetOrderItemsQuery } = orderApi;
