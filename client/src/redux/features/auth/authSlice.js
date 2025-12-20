import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  role: null,   //  user/owner/deliveryBoy
  loading: false,
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
      state.loading = false;
    },

    userLoggedOut: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
  },

});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
