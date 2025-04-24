import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import { authApi } from "../features/auth/authApi";

import cartReducer from "../features/cart/cartSlice";
import { cartApi } from "../features/cart/cartApi";

const rootReducer = combineReducers({
    [authApi.reducerPath]: authApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer, 
    auth: authReducer,
    cart: cartReducer,
});

export default rootReducer;