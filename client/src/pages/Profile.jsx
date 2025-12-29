import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../utils/user.jpg";
import Navbar from "../components/Navbar";
import { FaPen } from "react-icons/fa";
import EditProfileModal from "./EditProfileModal";
import { useLogoutUserMutation } from "../redux/features/auth/authApi";
import { userLoggedOut } from "../redux/features/auth/authSlice";
import { updateUserProfile } from "../redux/features/user/userSlice";
import {
  useLoadUserQuery,
  useUpdateUserDataMutation,
  useUploadProfileImageMutation,
} from "../redux/features/user/userApi";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const { data, isLoading, refetch } = useLoadUserQuery();
  const [updateUserData] = useUpdateUserDataMutation();
  const [uploadProfileImage] = useUploadProfileImageMutation();
  const [logoutUser] = useLogoutUserMutation();
  const [newImage, setNewImage] = useState(user?.profilePicture || "");
  const [previewImage, setPreviewImage] = useState("");
  const [file, setFile] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [newPhone, setNewPhone] = useState(user?.phone || "");
  const [updatedAddress, setUpdatedAddress] = useState(user?.address || []);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (data) {
      dispatch(updateUserProfile(data));
      setNewImage(data.profilePicture);
      setNewName(data.name);
      setNewPhone(data.phone);
      setUpdatedAddress(data.address);
    }
  }, [data, dispatch]);

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

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
        setIsModified(true);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleProfilePictureChange = () => {
    fileInputRef.current.click();
  };

  const handleProfileSave = async () => {
    try {
      let imageUrl = newImage;

      if (file) {
        const formData = new FormData();
        formData.append("profileImage", file);

        const uploadResponse = await uploadProfileImage(formData).unwrap();
        imageUrl = uploadResponse.imageUrl;
      }

      const updatedData = {
        name: newName,
        email: user.email,
        phone: newPhone,
        address: updatedAddress,
        profilePicture: imageUrl,
      };

      const response = await updateUserData(updatedData).unwrap();
      console.log("response", response);

      dispatch(updateUserProfile(response));
      setNewImage(response.profilePicture);
      setPreviewImage("");
      setIsModified(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl shadow-md p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <img
              src={previewImage || newImage || defaultAvatar}
              alt="Profile"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-red-400"
              onClick={handleProfilePictureChange}
            />
            <button
              onClick={handleProfilePictureChange}
              className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-300 hover:bg-gray-200"
            >
              <FaPen className="text-gray-600" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="text-center md:text-left flex-1">
            <h3 className="text-gray-600 text-2xl">{user?.name}</h3>
            <p className="text-gray-600 text-xl">{user?.email}</p>
            <p className="text-gray-600">{user?.phone || "No phone number added"}</p>

            <div className="mt-4 flex sm:flex-col md:flex-row gap-5 justify-center md:justify-start">
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
              {isModified && (
                <button
                  onClick={handleProfileSave}
                  className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-white rounded-3xl shadow-md p-6 mt-8">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Saved Addresses</h3>
          {user?.address?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.address.map((addr, idx) => (
                <div
                  key={idx}
                  className="bg-gray-100 p-5 rounded-2xl shadow-inner border border-gray-200"
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

        {/* Edit Modal */}
        {isEditing && (
          <EditProfileModal
            user={user}
            onClose={() => setIsEditing(false)}
            onSave={(updatedUser) => {
              dispatch(updateUserProfile(updatedUser));
              setUpdatedAddress(updatedUser.address);
              setNewName(updatedUser.name);
              setNewPhone(updatedUser.phone);
              setIsModified(true);
              setIsEditing(false);
            }}
          />
        )}

        {/* Orders Section */}
        <div className="border-t border-gray-300 pt-6">
          <h3 className="text-lg font-semibold text-gray-700">My Orders</h3>
          {user?.orders?.length > 0 ? (
            <ul className="space-y-3">
              {user?.orders.map((order, index) => (
                <li key={order.id || index} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Order ID: {order.id}</p>
                  <p className="text-sm text-gray-600">Status: {order.status}</p>
                  <p className="text-sm font-semibold text-gray-800">Total: ₹{order.total}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No orders found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
