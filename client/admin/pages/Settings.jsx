import { useDispatch } from 'react-redux';
import { userLoggedOut } from '../../src/redux/features/auth/authSlice';
import { useLogoutUserMutation } from "../../src/redux/features/auth/authApi";

import Button from '../../src/components/Button';
const Settings = () => {
    const dispatch = useDispatch();
    const [logoutUser] = useLogoutUserMutation();

    const handleLogout = async () => {
        try {
            await logoutUser();
            dispatch(userLoggedOut());
        } catch (error) {
            console.error("Logout failed:", err);
        }
    }
    return (
        <div className="flex justify-center mt-10">
            <Button onClick={handleLogout} text="Logout" />
        </div>
    )
}

export default Settings
