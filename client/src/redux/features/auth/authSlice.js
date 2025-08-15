import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "./authApi"; // Make sure the path is correct

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {

    userLoggedIn: (state, action) => {
      const user = action.payload?.user || action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.success = true;
      state.loading = false;
    },

    userLoggedOut: (state,action) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
  },

});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
