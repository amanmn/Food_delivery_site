import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  location: {
    lat: null,
    lon: null,
    address: null
  }
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setLocation: (state, action) => {
      const { lat, lon } = action.payload
      state.location.lat = lat
      state.location.lon = lon
    },
    setAddress: (state, action) => {
      state.address = action.payload
    },
    clearLocation: (state) => {
      state.location = null;
    },
  },
});

export const { setLocation, setAddress, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
