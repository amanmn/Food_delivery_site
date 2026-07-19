import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IoIosArrowRoundBack } from "react-icons/io";
import { userLoggedOut } from "../../src/redux/features/auth/authSlice";
import { useLogoutUserMutation } from "../../src/redux/features/auth/authApi";
import { useDeleteShopMutation } from "../../src/redux/features/shop/shopApi";
import Button from '../../src/components/Button';

const Settings = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [logoutUser] = useLogoutUserMutation();
    const [deleteShop, { isLoading: isDeleting }] = useDeleteShopMutation();
    const [confirmText, setConfirmText] = useState("");

    const handleLogout = async () => {
        try {
            await logoutUser().unwrap();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            dispatch(userLoggedOut());
            navigate("/", { replace: true });
        }
    };

    const handleDeleteShop = async () => {
        if (confirmText !== "DELETE") {
            toast.error('Type "DELETE" to confirm');
            return;
        }
        try {
            await deleteShop().unwrap();
            toast.success("Shop deleted");
            dispatch(userLoggedOut());
            navigate("/", { replace: true });
        } catch (err) {
            toast.error(err?.data?.message || "Failed to delete shop");
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 px-4 space-y-6">
            <button
                onClick={() => navigate("/dash")}
                className="absolute -top-2 left-4 sm:left-0 cursor-pointer"
                aria-label="Back to dashboard"
            >
                <IoIosArrowRoundBack className="text-blue-500" size={40} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            {/* Account section */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="font-semibold text-gray-800 mb-3">Account</h2>
                <button
                    onClick={handleLogout}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition"
                >
                    Log out
                </button>
            </div>

            {/* Danger zone */}
            <div className="bg-white border border-red-200 rounded-xl p-5">
                <h2 className="font-semibold text-red-600 mb-1">Danger zone</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Deleting your shop removes it and all its menu items permanently.
                    This cannot be undone. Past orders are kept for your records.
                </p>
                <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder='Type "DELETE" to confirm'
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <button
                    onClick={handleDeleteShop}
                    disabled={isDeleting || confirmText !== "DELETE"}
                    className="bg-red-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isDeleting ? "Deleting..." : "Delete my shop"}
                </button>
            </div>
        </div>
    );
};

export default Settings;