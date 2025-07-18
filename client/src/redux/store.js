import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers/rootReducer";
import { authApi } from "../redux/features/auth/authApi";
// import {userApi} from "../redux/features/user/userApi"
import { cartApi } from "../redux/features/cart/cartApi"; 
import { productApi } from "./features/product/productApi";
import { orderApi } from "./features/order/orderApi";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(
        authApi.middleware,
        // userApi.middleware,
        cartApi.middleware,
        productApi.middleware,
        orderApi.middleware
      ),
});

export default store;

// const initializeApp = async()=>{
//   await appStore.dispatch(authApi.endpoints.loadUser.initiate({},{forceRefetch:true}))
// }
// initializeApp();
