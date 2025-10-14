import React from 'react'
import { userLoggedOut } from '../../src/redux/features/auth/authSlice';
import { useDispatch } from 'react-redux';
import Button from '../../src/components/Button';
const Settings = () => {
    const dispatch = useDispatch();
    
    const handleLogout = () => {
        console.log("logout");
        dispatch(userLoggedOut());
    }
    return (
        <div className="flex justify-center mt-10">
            <Button onClick={handleLogout} text="Logout" />
        </div>
    )
}

export default Settings
