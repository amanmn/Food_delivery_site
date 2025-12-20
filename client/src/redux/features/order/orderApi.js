import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BASEURL?.replace(/\/+$/, "") || "http://localhost:8000";

export const orderApi = createApi({
    reducerPath: "orderApi",    
    baseQuery: fetchBaseQuery({
        baseUrl: `${BASE_URL}/api/order`,
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
            query: () => ({ url: "orders", method: "GET" }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.orders.map((ord) => ({ type: "Orders", id: ord._id })),
                        { type: "Orders", id: "LIST" },
                    ]
                    : [{ type: "Orders", id: "LIST" }],
        }),
        updateOrderStatus: builder.mutation({
            query: ({ orderId, shopOrderId, status }) => ({
                url: `update-status`,
                method: "PUT",
                body: { orderId, shopOrderId, status },
                credentials: "include",
            }),
            invalidatesTags: (result, error, { orderId }) => [
                { type: "Orders", id: orderId },
                { type: "Orders", id: "LIST" },
            ]
        }),
        getDeliveryBoyAssignments: builder.query({
            query: () => ({
                url: "get-assignments",        //     /api/order/get-assignments
                method: "GET"
            }),
            providesTags: ["Orders"],
        }),
        acceptDeliveryAssignment: builder.mutation({
            query: (assignmentId) => ({
                url: `accept-assignment/${assignmentId}`,               //     /api/order/place-order
                method: "POST",
                body: assignmentId,
            }),
            invalidatesTags: ["Orders"], // ensure state refetch
        }),
        getOrderById: builder.query({
            query: (orderId) => ({
                url: `get-order-by-id/${orderId}`,               //     /api/order/get-order-by-id/:orderId
                method: "GET",
            }),
            providesTags: ["Orders"],
        }),
        sendDeliveryOtp: builder.mutation({
            query: ({assignmentId, orderId, shopOrderId }) => ({
                url: `send-delivery-otp`,               //     /api/order/send-delivery-otp     
                method: "POST",
                body: { assignmentId, orderId, shopOrderId },
            }),
            invalidatesTags: ["Orders"],
        }),
        verifyDeliveryOtp: builder.mutation({
            query: ({assignmentId, orderId, shopOrderId, otp }) => ({
                url: `verify-delivery-otp`,               //     /api/order/verify-delivery-otp
                method: "POST",
                body: {assignmentId, orderId, shopOrderId, otp },
            }),
            invalidatesTags: ["Orders"],
        }),
    }),
});

export const {
    usePlaceOrderMutation,
    useGetOrderItemsQuery,
    useUpdateOrderStatusMutation,
    useGetDeliveryBoyAssignmentsQuery,
    useAcceptDeliveryAssignmentMutation,
    useGetOrderByIdQuery,
    useSendDeliveryOtpMutation,
    useVerifyDeliveryOtpMutation
} = orderApi;
