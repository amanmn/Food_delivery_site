import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLoadUserDataQuery } from "../src/redux/features/auth/authApi";
import { userLoggedIn, userLoggedOut } from "../src/redux/features/auth/authSlice";
import { ColorRing } from "react-loader-spinner";

const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();

    const { data, isLoading, isError } = useLoadUserDataQuery(undefined, {
        refetchOnMountOrArgChange: false,
    });

    useEffect(() => {
        if (data) {
            dispatch(userLoggedIn(data));
        }

        else if (!isLoading && isError) {
            dispatch(userLoggedOut());
        }
    }, [isLoading, isError, data, dispatch]);

    // 🔥 ONLY block UI while loading
    // if (isLoading) {
    //     return (
    //         <div className="flex justify-center items-center h-screen">
    //             <ColorRing height="80" width="80" />
    //         </div>
    //     );
    // }

    return children;
};

export default AuthProvider;
