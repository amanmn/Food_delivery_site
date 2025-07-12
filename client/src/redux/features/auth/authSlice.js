import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "./authApi"; // Make sure the path is correct

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  selectedAddress: null, // ✅ Add this
  initialState,
  reducers: {

    userLoggedIn: (state, action) => {
      const user = action.payload?.user || action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.loading = false;
    },

    updateUserProfile: (state, action) => {
      state.user = action.payload;
      if (action.payload.selectedAddress) {
        state.selectedAddress = action.payload.selectedAddress;
      }
    },

    updateSelectedAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },

    userLoggedOut: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
  },

  // Handles loading state from RTK Query's loadUser API
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.loadUser.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(authApi.endpoints.loadUser.matchFulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.loadUser.matchRejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});

export const { userLoggedIn, updateUserProfile, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
