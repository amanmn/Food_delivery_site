import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import defaultAvatar from "../utils/user.jpg";
import Navbar from "../components/Navbar";
import {
  FaPen,
  FaPlus,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaReceipt,
  FaPhone,
  FaEnvelope,
  FaShieldAlt,
  FaHeart,
  FaWallet,
  FaBell,
  FaChevronRight,
  FaCheckCircle,
} from "react-icons/fa";
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

  const handleProfilePictureChange = () => fileInputRef.current.click();

  const handleImageChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result);
    reader.readAsDataURL(selectedFile);

    try {
      const formData = new FormData();
      formData.append("profileImage", selectedFile);

      const uploadResponse = await uploadProfileImage(formData).unwrap();
      if (!uploadResponse?.imageUrl) throw new Error("Upload did not return an image URL");

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

  // Derived stats (visual only — falls back gracefully)
  const stats = [
    { label: "Orders", value: user?.orders?.length ?? user?.orderCount ?? 0, icon: FaReceipt, tint: "from-orange-500 to-amber-500" },
    { label: "Addresses", value: user?.address?.length ?? 0, icon: FaMapMarkerAlt, tint: "from-pink-500 to-rose-500" },
    { label: "Favorites", value: user?.favorites?.length ?? 0, icon: FaHeart, tint: "from-fuchsia-500 to-purple-500" },
    { label: "Wallet", value: user?.wallet ? `₹${user.wallet}` : "₹0", icon: FaWallet, tint: "from-emerald-500 to-teal-500" },
  ];

  const quickLinks = [
    { label: "My Orders", desc: "Track & re-order", icon: FaReceipt, action: () => navigate("/order"), tint: "from-orange-500 to-pink-500" },
    { label: "Favorites", desc: "Saved dishes & shops", icon: FaHeart, action: () => navigate("/favorites"), tint: "from-pink-500 to-rose-500" },
    { label: "Notifications", desc: "Order & offer alerts", icon: FaBell, action: () => navigate("/notifications"), tint: "from-amber-500 to-orange-500" },
    { label: "Security", desc: "Password & account", icon: FaShieldAlt, action: () => navigate("/security"), tint: "from-violet-500 to-indigo-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-pink-50 relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 sm:w-[28rem] sm:h-[28rem] rounded-full bg-orange-300/40 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-24 w-72 h-72 sm:w-[28rem] sm:h-[28rem] rounded-full bg-pink-300/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="relative pt-24 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-24">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 sm:mb-6 flex items-end justify-between gap-3"
        >
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-orange-600 uppercase tracking-wider">
              Account
            </p>
            <h1 className="mt-0.5 text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight truncate">
              My Profile
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 px-3 py-1.5 rounded-full">
            <FaCheckCircle /> Verified account
          </div>
        </motion.div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* LEFT COLUMN — Profile hero + Stats */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-orange-500/10 ring-1 ring-orange-100"
            >
              {/* Gradient banner */}
              <div className="relative h-28 sm:h-36 bg-gradient-to-r from-orange-500 via-amber-500 to-pink-500">
                <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_60%,white,transparent_40%)]" />
                <div className="absolute -bottom-6 right-4 sm:right-6 flex sm:hidden gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/90 bg-white/20 backdrop-blur px-2.5 py-1 rounded-full ring-1 ring-white/30">
                    Foodie
                  </span>
                </div>
              </div>

              <div className="px-4 sm:px-8 pb-6 sm:pb-8 -mt-14 sm:-mt-16">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 sm:gap-6 items-end sm:items-center">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="p-1 rounded-full bg-gradient-to-br from-orange-500 via-amber-400 to-pink-500 shadow-xl shadow-orange-500/40">
                      <img
                        src={currentImage}
                        alt="Profile"
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white bg-white"
                      />
                    </div>
                    <button
                      onClick={handleProfilePictureChange}
                      disabled={isUploadingImage}
                      className="absolute bottom-1 right-1 bg-white p-2.5 rounded-full shadow-md ring-1 ring-orange-100 hover:bg-orange-50 hover:scale-105 active:scale-95 transition disabled:opacity-50"
                      aria-label="Change profile picture"
                    >
                      <FaPen className="text-orange-600 text-[11px]" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {isUploadingImage && (
                      <p className="text-[11px] font-medium text-orange-600 mt-1 absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        Uploading...
                      </p>
                    )}
                  </div>

                  {/* Name + meta */}
                  <div className="min-w-0 pt-2 sm:pt-10">
                    {!isEditing && (
                      <>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 truncate">
                          {user?.name || "Welcome"}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-gray-600">
                          <span className="inline-flex items-center gap-1.5 min-w-0">
                            <FaEnvelope className="text-orange-500 shrink-0" size={12} />
                            <span className="truncate">{user?.email}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <FaPhone className="text-orange-500 shrink-0" size={12} />
                            {user?.phone || "Add phone"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Edit form OR action row */}
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-5 sm:mt-6 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full name</label>
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Full name"
                            className="w-full bg-white border border-orange-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone number</label>
                          <input
                            type="text"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="Phone number"
                            className="w-full bg-white border border-orange-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
                        <button
                          onClick={handleSaveDetails}
                          disabled={isSaving}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-95 transition disabled:opacity-60"
                        >
                          {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setNewName(user?.name || "");
                            setNewPhone(user?.phone || "");
                          }}
                          className="flex-1 sm:flex-none bg-white text-gray-700 ring-1 ring-gray-200 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-5 sm:mt-6 flex flex-wrap gap-2 sm:gap-3"
                    >
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-95 transition text-sm"
                      >
                        <FaPen size={11} /> Edit Profile
                      </button>
                      <button
                        onClick={() => navigate("/order")}
                        className="inline-flex items-center gap-2 bg-white text-orange-600 ring-1 ring-orange-200 hover:bg-orange-50 px-5 py-2.5 rounded-xl font-semibold transition text-sm"
                      >
                        <FaReceipt size={12} /> Orders
                      </button>
                      <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50 px-5 py-2.5 rounded-xl font-semibold transition text-sm ml-auto"
                      >
                        <FaSignOutAlt size={13} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
            >
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl ring-1 ring-orange-100 shadow-lg shadow-orange-500/5 p-3 sm:p-4"
                >
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${s.tint} flex items-center justify-center shadow-md shadow-orange-500/20`}>
                    <s.icon className="text-white" size={14} />
                  </div>
                  <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-black text-gray-900 tracking-tight truncate">
                    {s.value}
                  </p>
                  <p className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Address Section */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-orange-500/5 ring-1 ring-orange-100 p-5 sm:p-6"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <FaMapMarkerAlt className="text-white" size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">Saved Addresses</h3>
                    <p className="text-[11px] sm:text-xs text-gray-500">Deliver faster to your regular spots</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-3 sm:px-4 py-2 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-95 transition text-xs sm:text-sm font-semibold"
                >
                  <FaPlus size={10} /> <span className="hidden xs:inline sm:inline">Add</span>
                </button>
              </div>

              {user?.address?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {user.address.map((addr, idx) => (
                    <motion.div
                      key={addr._id || idx}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.04 }}
                      className="relative group bg-gradient-to-br from-orange-50 to-pink-50 p-4 rounded-2xl ring-1 ring-orange-100 hover:ring-orange-300 hover:shadow-lg hover:shadow-orange-500/10 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-white ring-1 ring-orange-200 flex items-center justify-center">
                          <FaMapMarkerAlt className="text-orange-500" size={13} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                              {addr.label}
                            </p>
                            {idx === 0 && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed break-words mt-1">
                            {addr.street}, {addr.city}, {addr.state}, {addr.country} - {addr.zipCode}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-orange-100 flex items-center justify-center">
                    <FaMapMarkerAlt className="text-orange-500" size={20} />
                  </div>
                  <p className="text-gray-500 text-sm">
                    No addresses added yet. Add one to speed up checkout.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT COLUMN — Quick actions */}
          <div className="space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-orange-500/5 ring-1 ring-orange-100 p-5 sm:p-6"
            >
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {quickLinks.map((q) => (
                  <button
                    key={q.label}
                    onClick={q.action}
                    className="group flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-orange-50/60 to-pink-50/60 ring-1 ring-orange-100 hover:ring-orange-300 hover:shadow-md hover:shadow-orange-500/10 transition text-left"
                  >
                    <div className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br ${q.tint} flex items-center justify-center shadow-md shadow-orange-500/20`}>
                      <q.icon className="text-white" size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{q.label}</p>
                      <p className="text-[11px] text-gray-500 truncate">{q.desc}</p>
                    </div>
                    <FaChevronRight className="text-gray-400 group-hover:text-orange-500 transition shrink-0" size={11} />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Promo / referral card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-pink-500 rounded-3xl shadow-xl shadow-orange-500/30 p-5 sm:p-6 text-white"
            >
              <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -right-2 -top-2 w-24 h-24 rounded-full bg-white/10 blur-xl" />
              <div className="relative">
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur px-2.5 py-1 rounded-full ring-1 ring-white/30">
                  Rewards
                </span>
                <h3 className="mt-3 text-xl sm:text-2xl font-black leading-tight">
                  Invite friends,<br />earn ₹100 off
                </h3>
                <p className="text-white/90 text-xs sm:text-sm mt-2">
                  Share your code and get credits on your next order.
                </p>
                <button
                  onClick={() => navigate("/refer")}
                  className="mt-4 bg-white text-orange-600 hover:bg-orange-50 px-5 py-2.5 rounded-xl font-bold shadow-lg hover:scale-[1.03] active:scale-95 transition text-sm"
                >
                  Invite now →
                </button>
              </div>
            </motion.div>
          </div>
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
