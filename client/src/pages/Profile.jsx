import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../utils/user.jpg";
import Navbar from "../components/Navbar";
import { FaPen, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import EnterAddressModal from "../components/cartAddressModel";
import { useLogoutUserMutation } from "../redux/features/auth/authApi";
import { userLoggedOut, updateUser } from "../redux/features/auth/authSlice";
import {
  useLoadUserQuery,
  useUpdateUserDataMutation,
  useUploadProfileImageMutation,
} from "../redux/features/user/userApi";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data } = useLoadUserQuery();
  const [updateUserData, { isLoading: isSaving }] = useUpdateUserDataMutation();
  const [uploadProfileImage, { isLoading: isUploadingImage }] = useUploadProfileImageMutation();
  const [logoutUser] = useLogoutUserMutation();

  const [previewImage, setPreviewImage] = useState("");
  const [file, setFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [newPhone, setNewPhone] = useState(user?.phone || "");

  const fileInputRef = useRef(null);

  // Keep local auth state in sync whenever the server data refreshes
  useEffect(() => {
    if (data) {
      dispatch(updateUser(data));
      setNewName(data.name || "");
      setNewPhone(data.phone || "");
    }
  }, [data, dispatch]);

  const currentImage = previewImage || user?.profilePicture || defaultAvatar;

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      dispatch(userLoggedOut());
      navigate("/", { replace: true });
    }
  };

  const handleProfilePictureChange = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result);
    reader.readAsDataURL(selectedFile);

    // Upload immediately, then save the returned URL right away
    try {
      const formData = new FormData();
      formData.append("profileImage", selectedFile);

      const uploadResponse = await uploadProfileImage(formData).unwrap();
      if (!uploadResponse?.imageUrl) {
        throw new Error("Upload did not return an image URL");
      }

      const response = await updateUserData({
        profilePicture: uploadResponse.imageUrl,
      }).unwrap();

      dispatch(updateUser(response.user));
      setPreviewImage("");
      setFile(null);
      toast.success("Profile picture updated");
    } catch (err) {
      console.error("Profile picture update failed:", err);
      toast.error(err?.data?.message || "Failed to update profile picture");
      setPreviewImage("");
      setFile(null);
    }
  };

  const handleSaveDetails = async () => {
    try {
      const response = await updateUserData({
        name: newName,
        phone: newPhone,
      }).unwrap();
      dispatch(updateUser(response.user));
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  const handleAddAddress = async (addressForm) => {
    try {
      const response = await updateUserData({ newAddress: addressForm }).unwrap();
      dispatch(updateUser(response.user));
      toast.success("Address added");
    } catch (err) {
      console.error("Add address failed:", err);
      toast.error(err?.data?.message || "Failed to add address");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 pb-16">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-md p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="relative shrink-0">
            <img
              src={currentImage}
              alt="Profile"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-red-400"
            />
            <button
              onClick={handleProfilePictureChange}
              disabled={isUploadingImage}
              className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-300 hover:bg-gray-200 disabled:opacity-50"
              aria-label="Change profile picture"
            >
              <FaPen className="text-gray-600 text-sm" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {isUploadingImage && (
              <p className="text-xs text-gray-500 mt-1 absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                Uploading...
              </p>
            )}
          </div>

          <div className="flex-1 w-full">
            {isEditing ? (
              <div className="space-y-3 max-w-sm mx-auto sm:mx-0">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Full name"
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <div className="flex gap-3 justify-center sm:justify-start">
                  <button
                    onClick={handleSaveDetails}
                    disabled={isSaving}
                    className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setNewName(user?.name || "");
                      setNewPhone(user?.phone || "");
                    }}
                    className="bg-gray-200 text-gray-700 px-5 py-2 rounded-xl hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-gray-800 text-2xl font-semibold">{user?.name}</h3>
                <p className="text-gray-600 text-lg">{user?.email}</p>
                <p className="text-gray-600">{user?.phone || "No phone number added"}</p>

                <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-white rounded-3xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-700">Saved Addresses</h3>
            <button
              onClick={() => setShowAddAddress(true)}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition text-sm font-medium"
            >
              <FaPlus size={12} /> Add Address
            </button>
          </div>

          {user?.address?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.address.map((addr, idx) => (
                <div
                  key={addr._id || idx}
                  className="bg-gray-50 p-5 rounded-2xl border border-gray-200"
                >
                  <p className="text-lg font-medium text-gray-800 mb-1">{addr.label}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {addr.street},<br />
                    {addr.city}, {addr.state},<br />
                    {addr.country} - {addr.zipCode}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm">No addresses added yet.</p>
          )}
        </div>

        {/* Orders link-out card (real-time order status lives on the dedicated Orders page) */}
        <div className="bg-white rounded-3xl shadow-md p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-semibold text-gray-800">My Orders</h3>
            <p className="text-gray-500 text-sm mt-1">
              Track live status, delivery progress, and order history.
            </p>
          </div>
          <button
            onClick={() => navigate("/order")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition whitespace-nowrap"
          >
            View My Orders
          </button>
        </div>
      </div>

      {showAddAddress && (
        <EnterAddressModal
          onClose={() => setShowAddAddress(false)}
          onSave={handleAddAddress}
        />
      )}
    </div>
  );
};

export default Profile;