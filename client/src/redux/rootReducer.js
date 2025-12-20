// rootReducer.js
import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; 

import authReducer, { userLoggedOut } from "./features/auth/authSlice";
import userReducer from "./features/user/userSlice";
import cartReducer from "./features/cart/cartSlice";
import orderReducer from "./features/order/orderSlice";
import locationReducer from "./features/location/locationSlice";
import ownerReducer from "./features/owner/ownerSlice";
import deliveryLocationReducer from "./features/deliveryBoyLocation/deliveryLocationSlice"; // ✅ import this


import { authApi } from "./features/auth/authApi";
import { userApi } from "./features/user/userApi";
import { cartApi } from "./features/cart/cartApi";
import { itemApi } from "./features/product/itemApi";
import { orderApi } from "./features/order/orderApi";
import { ownerApi } from "./features/owner/ownerApi";

const appReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [itemApi.reducerPath]: itemApi.reducer,
  [cartApi.reducerPath]: cartApi.reducer,
  [orderApi.reducerPath]: orderApi.reducer,
  [ownerApi.reducerPath]: ownerApi.reducer,
  auth: authReducer,
  user: userReducer,
  cart: cartReducer,
  order: orderReducer,
  location: locationReducer,
  owner: ownerReducer,
  deliveryLocation: deliveryLocationReducer,
});

// 🧹 Reset all Redux state on logout
const rootReducer = (state, action) => {
  if (action.type === userLoggedOut.type) {
    storage.removeItem("persist:root"); // clear persisted storage
    state = undefined;
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
    "user", // optional (profile only, not auth)
  ],
};


export default persistReducer(persistConfig, rootReducer);
