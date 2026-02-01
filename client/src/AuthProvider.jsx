import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetMeQuery } from "./redux/features/auth/authApi";
import {
  userLoggedIn,
  userLoggedOut,
} from "./redux/features/auth/authSlice";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  const { data, isFetching, isError } = useGetMeQuery(undefined, {
    // Prevent unnecessary refetches that trigger /api/auth/me on every route change or focus
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (isFetching) return;
    if (data) {
      dispatch(userLoggedIn(data));
    } else {
      dispatch(userLoggedOut());
    }
  }, [data, isFetching, isError, dispatch]);

  // ✅ Do NOT block UI aggressively (prevents flicker)
  // Always render children so public routes remain accessible while auth check runs.
  // Auth state will be updated via dispatched actions when the query resolves.
  return children;
};

export default AuthProvider;
