// import { createSlice } from "@reduxjs/toolkit";
// import axios from "axios";

// const API_URL = "http://localhost:8000";

// const initialState = {
//   user: JSON.parse(localStorage.getItem("user")) || null,
//   token: localStorage.getItem("token") || null,
//   users: [],
//   // status: "idle",
//   error: null,
// };

// const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     setUsers: (state, action) => {
//       state.users = action.payload;
//     },
//     setUser: (state, action) => {
//       state.user = action.payload;
//     },
//     updateUserProfileLocally: (state, action) => {
//       state.user = { ...state.user, ...action.payload };
//       localStorage.setItem("user", JSON.stringify(state.user));
//     },
//     setStatus: (state, action) => {
//       state.status = action.payload;
//     },
//     setError: (state, action) => {
//       state.error = action.payload;
//     },
//   },
// });

// export const {
//   login,
//   logout,
//   setUsers,
//   setUser,
//   updateUserProfileLocally,
//   setStatus,
//   setError,
// } = userSlice.actions;

// export default userSlice.reducer;
