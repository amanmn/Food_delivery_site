import { createSlice } from "@reduxjs/toolkit";
// import { placeOrder } from "../../../../../server/controllers/orderController";

const orderSlice = createSlice({
    name: "order",
    initialState: {
        orderplace: [],
    },
    reducers: {
        placeOrder: (state, action) => {
            const order = action.payload
            console.log(order);
        }
    }
})
export const {orderplace} = orderSlice.actions
export default orderSlice.reducer;