import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
    name: "order",
    initialState: {
        orderplace: [],
        myOrders: [],
    },
    reducers: {
        placeOrder: (state, action) => {
            const newOrder = action.payload;
            state.orderplace.push(newOrder);
        },
        setMyOrders: (state, action) => {
            state.myOrders = action.payload
        },
        updateOrderStatus: (state, action) => {
            const { orderId, shopOrderId, status } = action.payload;
            const order = state.myOrders?.find((ord) => ord._id === orderId);
            if (order) {
                const shopOrder = order.shopOrders.find((so) => so._id === shopOrderId);
                if (shopOrder) {
                    shopOrder.status = status;
                }
            }
        },
        updateRealTimeOrderStatus: (state, action) => {
            const { orderId, shopOrderId, status } = action.payload;
            const order = state.myOrders?.find((ord) => ord._id === orderId);

            if (order) {
                const shopOrder = order.shopOrders.find((so) => so._id === shopOrderId);
                if (shopOrder) {
                    shopOrder.status = status;
                }
            }
        }
    }
})
export const {
    placeOrder,
    setMyOrders,
    updateOrderStatus,
    updateRealTimeOrderStatus
} = orderSlice.actions
export default orderSlice.reducer;