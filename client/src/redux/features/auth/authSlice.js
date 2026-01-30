import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  authChecked: false,
  role: null,
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
      state.authChecked = true;
    },

    userLoggedOut: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.authChecked = true;
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
