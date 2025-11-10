import { createSlice } from "@reduxjs/toolkit";
// import { placeOrder } from "../../../../../server/controllers/orderController";

const orderSlice = createSlice({
    name: "order",
    initialState: {
        orderplace: [],
        myOrders: null,
    },
    reducers: {
        placeOrder: (state, action) => {
            const newOrder = action.payload;
            state.orderplace.push(newOrder);
        },
        setMyOrders: (state, action) => {
            state.myOrders = action.payload
        }
    }
})
export const { placeOrder, setMyOrders } = orderSlice.actions
export default orderSlice.reducer;