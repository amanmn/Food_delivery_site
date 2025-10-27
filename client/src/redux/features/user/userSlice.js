import { createSlice } from "@reduxjs/toolkit";
import { userApi } from "./userApi";

const initialState = {
    user: null,
    city: null,
    selectedAddress: null,
    loading: true,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateUserProfile: (state, action) => {
            state.user = action.payload;
            if (action.payload?.selectedAddress) {
                state.selectedAddress = action.payload.selectedAddress;
            }
        },
        updateSelectedAddress: (state, action) => {
            state.selectedAddress = action.payload;
        },
        setCity: (state, action) => {
            state.city = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            // RTK Query: loadUser status
            .addMatcher(userApi.endpoints.loadUser.matchPending, (state) => {
                state.loading = true;
            })
            .addMatcher(userApi.endpoints.loadUser.matchFulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addMatcher(userApi.endpoints.loadUser.matchRejected, (state) => {
                state.user = null;
                state.loading = false;
            });
    },
});

export const {
    updateUserProfile,
    updateSelectedAddress,
    setCity
} = userSlice.actions;
export default userSlice.reducer;
