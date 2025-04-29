// redux/slices/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: [],
  },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      console.log("added item",item);
      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        // If item exists, update quantity
        state.cartItems = state.cartItems.map((x) =>
          x._id === item._id ? { ...x, quantity: x.quantity + item.quantity } : x
        );
      } else {
        state.cartItems.push(item);
      }
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
    },

    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
