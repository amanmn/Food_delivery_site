import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { authApi } from "../redux/features/auth/authApi";
import { userApi } from "../redux/features/user/userApi"
import { cartApi } from "../redux/features/cart/cartApi";
import { productApi } from "./features/product/productApi";
import { orderApi } from "./features/order/orderApi";
import { ownerApi } from "./features/owner/ownerApi";


const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      cartApi.middleware,
      productApi.middleware,
      orderApi.middleware,
      ownerApi.middleware
    ),
  devTools: process.env.NODE_ENV !== "production", // ✅ Enables Redux DevTools only in development
});

export default store;

// const initializeApp = async()=>{
//   await appStore.dispatch(authApi.endpoints.loadUser.initiate({},{forceRefetch:true}))
// }
// initializeApp();
