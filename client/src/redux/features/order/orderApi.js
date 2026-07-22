import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../baseQueryWithReauth";

export const orderApi = createApi({
    reducerPath: "orderApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Cart", "Orders", "User"],

    endpoints: (builder) => ({
        placeOrder: builder.mutation({
            query: (orderData) => ({
                url: "/order/place-order",
                method: "POST",
                body: orderData,
            }),
            invalidatesTags: ["Cart", "Orders", "User"],
        }),
        verifyPayment: builder.mutation({
            query: (paymentData) => ({
                url: "/order/verify-payment",
                method: "POST",
                body: paymentData,
            }),
        }),
        getOrderItems: builder.query({
            query: () => ({
                url: "/order/orders",
                method: "GET"
            }),
            providesTags: (result) => {
                if (!result || !result.orders) {
                    return [{ type: "Orders", id: "LIST" }];
                }

                return [
                    ...result.orders.map((ord) => ({
                        type: "Orders",
                        id: ord._id,
                    })),
                    { type: "Orders", id: "LIST" },
                ];
            },
        }),
        updateOrderStatus: builder.mutation({
            query: ({ orderId, shopOrderId, status }) => ({
                url: `/order/update-status`,
                method: "PUT",
                body: { orderId, shopOrderId, status },
            }),
            invalidatesTags: [{ type: "Orders", id: "LIST" }],
        }),
        assignDeliveryBoy: builder.mutation({
            query: (data) => ({
                url: "/order/assign-delivery-boy",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Orders"],
        }),
        getDeliveryBoyAssignments: builder.query({
            query: () => "/order/get-assignments",
            providesTags: ["Orders"],
        }),
        acceptDeliveryAssignment: builder.mutation({
            query: (assignmentId) => ({
                url: `/order/accept-assignment/${assignmentId}`,
                method: "POST",
                body: assignmentId,
            }),
            invalidatesTags: ["Orders"],
        }),
        getOrderById: builder.query({
            query: (orderId) => `/order/get-order-by-id/${orderId}`,
            providesTags: ["Orders"],
        }),
        sendDeliveryOtp: builder.mutation({
            query: ({ assignmentId, orderId, shopOrderId }) => ({
                url: `/order/send-delivery-otp`,
                method: "POST",
                body: { assignmentId, orderId, shopOrderId },
            }),
            invalidatesTags: ["Orders"],
        }),
        verifyDeliveryOtp: builder.mutation({
            query: ({ assignmentId, orderId, shopOrderId, otp }) => ({
                url: `/order/verify-delivery-otp`,
                method: "POST",
                body: { assignmentId, orderId, shopOrderId, otp },
            }),
            invalidatesTags: ["Orders"],
        }),
        getDeliveryStats: builder.query({
            query: () => "/order/delivery/stats",
        }),
        declineAssignment: builder.mutation({
            query: (assignmentId) => ({
                url: `/order//decline-assignment/${assignmentId}`,
                method: "POST",
            }),
        }),
        getDeliveryHistory: builder.query({
            query: () => "/order//delivery/history",
        }),
    }),
});

export const {
    usePlaceOrderMutation,
    useVerifyPaymentMutation,
    useAssignDeliveryBoyMutation,
    useGetOrderItemsQuery,
    useUpdateOrderStatusMutation,
    useGetDeliveryBoyAssignmentsQuery,
    useAcceptDeliveryAssignmentMutation,
    useGetOrderByIdQuery,
    useSendDeliveryOtpMutation,
    useVerifyDeliveryOtpMutation,
    useGetDeliveryStatsQuery,
    useDeclineAssignmentMutation,
    useGetDeliveryHistoryQuery,
} = orderApi;
