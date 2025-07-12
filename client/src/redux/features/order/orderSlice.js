import { createSlice } from "@reduxjs/toolkit";
// import { placeOrder } from "../../../../../server/controllers/orderController";

const orderSlice = createSlice({
    name: "order",
    initialState: {
        orderplace: [],
    },
    reducers: {
        placeOrder: (state, action) => {
            const newOrder = action.payload;
            state.orderplace.push(newOrder); // Save the order in Redux
        }

    }
})
export const { placeOrder } = orderSlice.actions
export default orderSlice.reducer;