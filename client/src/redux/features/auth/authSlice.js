import { createSlice } from "@reduxjs/toolkit";
// import { updateUserData } from "../../../../../server/controllers/userController";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      const { user, token } = action.payload;

      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      // ✅ Save to localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    },
    
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },

    userLoggedOut: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      // ✅ Remove from localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const { userLoggedIn, updateUserProfile, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
