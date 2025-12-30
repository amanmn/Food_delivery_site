// rootReducer.js
import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer, { userLoggedOut } from "./features/auth/authSlice";
import userReducer from "./features/user/userSlice";
import cartReducer from "./features/cart/cartSlice";
import orderReducer from "./features/order/orderSlice";
import locationReducer from "./features/location/locationSlice";
import deliveryLocationReducer from "./features/deliveryBoyLocation/deliveryLocationSlice"; // ✅ import this

import { authApi } from "./features/auth/authApi";
import { userApi } from "./features/user/userApi";
import { cartApi } from "./features/cart/cartApi";
import { itemApi } from "./features/product/itemApi";
import { orderApi } from "./features/order/orderApi";
import { shopApi } from "./features/shop/shopApi";

const appReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [itemApi.reducerPath]: itemApi.reducer,
  [cartApi.reducerPath]: cartApi.reducer,
  [orderApi.reducerPath]: orderApi.reducer,
  [shopApi.reducerPath]: shopApi.reducer,

  auth: authReducer,
  user: userReducer,
  cart: cartReducer,
  order: orderReducer,
  location: locationReducer,
  deliveryLocation: deliveryLocationReducer,
});

// 🧹 Reset all Redux state on logout
const rootReducer = (state, action) => {
  if (action.type === userLoggedOut.type) {
    // 🧹 clear persisted storage
    storage.removeItem("persist:root");

    // reset everything
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};


// 🔒 persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: [
    "cart",
    "location",
    "deliveryLocation",
    "user", // profile only, not auth
  ],
};


export default persistReducer(persistConfig, rootReducer);
