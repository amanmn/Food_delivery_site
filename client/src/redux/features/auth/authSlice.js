import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  authChecked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      state.user = action.payload;
      state.role = action.payload.role;
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
