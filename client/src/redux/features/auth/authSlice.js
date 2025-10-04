import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "./authApi"; // Make sure the path is correct

const initialState = {
  user: null,
  isAuthenticated: false,
  role: null,   //  user/admin
  loading: true,

};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      const user = action.payload?.user || action.payload;
      state.user = user;
      state.role = user.role;
      state.isAuthenticated = true;
      state.success = true;
      state.loading = false;
    },

    userLoggedOut: (state, action) => {
      state.user = null;
      state.isAuthenticated = false;
      state.role = null;
      state.loading = false;
    },
  },

});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
