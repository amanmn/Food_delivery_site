import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers/rootReducer";
import { authApi } from "../redux/features/auth/authApi";
import { cartApi } from "../redux/features/cart/cartApi"; 

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(cartApi.middleware), 
});

export default store;

// const initializeApp = async()=>{
//   await appStore.dispatch(authApi.endpoints.loadUser.initiate({},{forceRefetch:true}))
// }
// initializeApp();
