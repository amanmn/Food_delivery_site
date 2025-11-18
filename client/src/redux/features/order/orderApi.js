import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = "http://localhost:8000/api/order";

export const orderApi = createApi({
    reducerPath: "orderApi",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        credentials: 'include',
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
        updateOrderStatus: builder.mutation({
            query: ({ orderId, shopOrderId, status }) => ({
                url: `update-status`,
                method: "PUT",
                body: { orderId, shopOrderId, status },
                credentials: "include",
            }),
            invalidatesTags: ["Orders"],
        }),
        getDeliveryBoyAssignments: builder.query({
            query: () => ({
                url: "get-assignments",        //     /api/order/get-assignments
                method: "GET"
            }),
            providesTags: ["Orders"],
        }),
    })
})

export const {
    usePlaceOrderMutation,
    useGetOrderItemsQuery,
    useUpdateOrderStatusMutation,
    useGetDeliveryBoyAssignmentsQuery
} = orderApi;
