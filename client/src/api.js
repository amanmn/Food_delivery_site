import axios from "axios";

const API = axios.create({
  // baseURL: import.meta.env.VITE_BASEURL || "/api",
  baseURL: import.meta.env.VITE_BASEURL,
  withCredentials: true,
});

export default API;
