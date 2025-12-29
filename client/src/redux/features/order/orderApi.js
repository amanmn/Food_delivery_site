import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const orderApi = createApi({
    reducerPath: "orderApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `/api/order`,
        credentials: 'include',
    }),

    tagTypes: ["Cart", "Orders", "User"],

    endpoints: (builder) => ({
        placeOrder: builder.mutation({
            query: (orderData) => ({
                url: "place-order",
                method: "POST",
                body: orderData,
            }),
            invalidatesTags: ["Cart", "Orders", "User"],
        }),
        getOrderItems: builder.query({
            query: () => ({
                url: "orders",
                method: "GET"
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.orders.map((ord) => ({
                            type: "Orders",
                            id: ord._id
                        })),
                        { type: "Orders", id: "LIST" },
                    ]
                    : [{ type: "Orders", id: "LIST" }],
        }),
        updateOrderStatus: builder.mutation({
            query: ({ orderId, shopOrderId, status }) => ({
                url: `update-status`,
                method: "PUT",
                body: { orderId, shopOrderId, status },
            }),
            invalidatesTags: (result, error, { orderId }) => [
                { type: "Orders", id: orderId },
                { type: "Orders", id: "LIST" },
            ]
        }),
        getDeliveryBoyAssignments: builder.query({
            query: () => "get-assignments",
            providesTags: ["Orders"],
        }),
        acceptDeliveryAssignment: builder.mutation({
            query: (assignmentId) => ({
                url: `accept-assignment/${assignmentId}`,
                method: "POST",
                body: assignmentId,
            }),
            invalidatesTags: ["Orders"],
        }),
        getOrderById: builder.query({
            query: (orderId) => `get-order-by-id/${orderId}`,
            providesTags: ["Orders"],
        }),
        sendDeliveryOtp: builder.mutation({
            query: ({ assignmentId, orderId, shopOrderId }) => ({
                url: `send-delivery-otp`,
                method: "POST",
                body: { assignmentId, orderId, shopOrderId },
            }),
            invalidatesTags: ["Orders"],
        }),
        verifyDeliveryOtp: builder.mutation({
            query: ({ assignmentId, orderId, shopOrderId, otp }) => ({
                url: `verify-delivery-otp`,
                method: "POST",
                body: { assignmentId, orderId, shopOrderId, otp },
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
