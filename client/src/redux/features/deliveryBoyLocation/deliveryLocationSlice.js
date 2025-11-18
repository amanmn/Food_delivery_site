// src/redux/slices/deliveryLocationSlice.js

import { createSlice } from "@reduxjs/toolkit";

const deliveryLocationSlice = createSlice({
  name: "deliveryLocation",
  initialState: {
    lat: null,
    lon: null,
    lastUpdated: null,
  },
  reducers: {
    setDeliveryLocation: (state, action) => {
      const { lat, lon } = action.payload;
      state.lat = lat;
      state.lon = lon;
      state.lastUpdated = new Date().toISOString();
    },
    clearDeliveryLocation: (state) => {
      state.lat = null;
      state.lon = null;
      state.lastUpdated = null;
    },
  },
});

export const { setDeliveryLocation, clearDeliveryLocation } = deliveryLocationSlice.actions;
export default deliveryLocationSlice.reducer;
