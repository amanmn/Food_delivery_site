import { createSlice } from "@reduxjs/toolkit";
import { userApi } from "../user/userApi";
const initialState = {
  user: null,
  // role: null,
  isAuthenticated: false,
  authChecked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      state.user = action.payload;
      // state.role = action.payload.role;
      state.isAuthenticated = true;
      state.authChecked = true;
    },

    userLoggedOut: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.authChecked = true;
    },
    setAuthChecked: (state, action) => {
      state.authChecked = action.payload;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      userApi.endpoints.loadUser.matchFulfilled,
      (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authChecked = true;
      }
    );
  }
});

export const {
  userLoggedIn,
  userLoggedOut,
  setAuthChecked,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;
