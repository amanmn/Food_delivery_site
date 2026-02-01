import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetMeQuery } from "./redux/features/auth/authApi";
import { userLoggedIn, userLoggedOut } from "./redux/features/auth/authSlice";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  const { data, isFetching, isError, error } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (isFetching) return;

    if (data?.user) {
      dispatch(userLoggedIn(data.user));
    } else if (error?.status === 401) {
      // Not logged in → treat as guest
      dispatch(userLoggedOut());
    } else if (isError) {
      console.error("Auth check failed:", error);
      dispatch(userLoggedOut());
    }
  }, [data, isFetching, isError, error, dispatch]);

  return children;
};

export default AuthProvider;
