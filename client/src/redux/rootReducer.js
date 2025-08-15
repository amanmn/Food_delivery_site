import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import userReducer from "./features/user/userSlice";
import cartReducer from "./features/cart/cartSlice";
import orderReducer from "./features/order/orderSlice";
import locationReducer from "./features/location/locationSlice";

import { authApi } from "./features/auth/authApi";
import { userApi } from "./features/user/userApi";
import { cartApi } from "./features/cart/cartApi";
import { productApi } from "./features/product/productApi";
import { orderApi } from "./features/order/orderApi";


const rootReducer = combineReducers({
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    auth: authReducer,
    user: userReducer,
    cart: cartReducer,
    order: orderReducer,
    location: locationReducer,
});

export default rootReducer;