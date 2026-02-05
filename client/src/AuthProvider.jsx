import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetMeQuery } from "./redux/features/auth/authApi";
import { userLoggedIn, userLoggedOut } from "./redux/features/auth/authSlice";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  const { data: user, isSuccess, isError, isLoading } = useGetMeQuery();
  // console.log("AuthProvider:", { isLoading, isSuccess, user });

  useEffect(() => {
    if (isSuccess && user) {
      dispatch(userLoggedIn(user));
    }
    if (isError) {
      dispatch(userLoggedOut());
    }
  }, [isSuccess, isError, user]);

  return children;
};

export default AuthProvider;
