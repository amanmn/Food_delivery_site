import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLoadUserDataQuery } from "./redux/features/auth/authApi";
import {
  userLoggedIn,
  userLoggedOut,
} from "./redux/features/auth/authSlice";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  const { data, isFetching, isError } = useLoadUserDataQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (data) {
      dispatch(userLoggedIn(data));
    } else if (!isFetching && isError) {
      dispatch(userLoggedOut());
    }
  }, [data, isFetching, isError, dispatch]);

  // ✅ Do NOT block UI aggressively (prevents flicker)
  if (isFetching) return null;

  return children;
};

export default AuthProvider;
