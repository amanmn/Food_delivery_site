import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
// import { logout } from "../redux/slices/userSlice";
import defaultAvatar from "../utils/user.jpg";
import Navbar from "../components/Navbar";
import { FaPen } from "react-icons/fa";
import axios from "axios";
import EditProfileModal from "./profilePicture"; // adjust path if needed
import { userLoggedOut } from "../redux/features/auth/authSlice";
import { useLoadUserQuery } from "../redux/features/auth/authApi";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [localUser, setLocalUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [newImage, setNewImage] = useState(localUser?.profilePicture || "");
  const [previewImage, setPreviewImage] = useState("");
  const [file, setFile] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [newName, setNewName] = useState(localUser?.name || "");
  const [newPhone, setNewPhone] = useState(localUser?.phone || "");
  const [updatedAddress, setUpdatedAddress] = useState(localUser?.address || []);

  const {data,isLoading}=useLoadUserQuery();
  console.log(data);
  
  const fileInputRef = useRef(null);

  const handleLogout = () => {
    dispatch(userLoggedOut());
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log(selectedFile);
    
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

        const res = await axios.post("http://localhost:8000/user/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        imageUrl = res.data.imageUrl;
      }

      const updatedProfile = {
        name: newName,
        phone: newPhone,
        profilePicture: imageUrl,
        address: updatedAddress,
      };

      await dispatch(updateUserProfile({ userId: localUser._id, updatedData: updatedProfile }));

      const updatedUser = {
        ...localUser,
        ...updatedProfile,
        profilePicture: imageUrl,
      };

      setLocalUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser)); // Update localStorage
      setNewImage(imageUrl);
      setIsModified(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl shadow-md p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
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
            <h3 className="text-gray-600 text-2xl">{localUser?.name}</h3>
            <p className="text-gray-600 text-xl">{localUser?.email}</p>
            <p className="text-gray-600">{localUser?.phone || "No phone number added"}</p>
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
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
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

          {localUser?.address?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {localUser.address.map((addr, idx) => (
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
          user={localUser}
          onClose={() => setIsEditing(false)}
          onSave={(updatedUser) => {
            console.log("onSave triggered");
            setLocalUser(updatedUser); // Update state with new address
            localStorage.setItem("user", JSON.stringify(updatedUser)); // Update localStorage
            setUpdatedAddress(updatedUser.address); // Update the address state
            setIsEditing(false);
            setIsModified(false);
          }}
          />
        )}

        {/* Orders Section */}
        <div className="border-t border-gray-300 pt-6">
          <h3 className="text-lg font-semibold text-gray-700">My Orders</h3>
          {localUser.orders && localUser.orders.length > 0 ? (
            <ul className="space-y-3">
              {localUser.orders.map((order) => (
                <li key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Order ID: {order.id}</p>
                  <p className="text-sm text-gray-600">Status: {order.status}</p>
                  <p className="text-sm font-semibold text-gray-800">Total: ${order.total}</p>
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
