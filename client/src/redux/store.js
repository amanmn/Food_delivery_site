// store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import persistedReducer from "./rootReducer";

import { authApi } from "../redux/features/auth/authApi";
import { userApi } from "../redux/features/user/userApi";
import { cartApi } from "../redux/features/cart/cartApi";
import { itemApi } from "../redux/features/product/itemApi";
import { orderApi } from "../redux/features/order/orderApi";
import { ownerApi } from "../redux/features/owner/ownerApi";

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }).concat(
      authApi.middleware,
      userApi.middleware,
      cartApi.middleware,
      itemApi.middleware,
      orderApi.middleware,
      ownerApi.middleware
    ),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);
export default store;
