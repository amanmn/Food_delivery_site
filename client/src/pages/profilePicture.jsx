import React, { useState } from "react";
import { useDispatch } from "react-redux";
// import { setUser } from "../redux/slices/userSlice";

const EditProfileModal = ({ user, onClose, onSave }) => {
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email] = useState(user?.email || ""); // read-only

  const [newStreet, setNewStreet] = useState(user?.address?.[0]?.street || "");
  const [newCity, setNewCity] = useState(user?.address?.[0]?.city || "");
  const [newState, setNewState] = useState(user?.address?.[0]?.state || "");
  const [newCountry, setNewCountry] = useState(user?.address?.[0]?.country || "");
  const [newZipCode, setNewZipCode] = useState(user?.address?.[0]?.zipCode || "");

  const handleSave = async (e) => {
    e.preventDefault();
  
    const updatedAddress = {
      label: "Primary",
      street: newStreet,
      city: newCity,
      state: newState,
      country: newCountry,
      zipCode: newZipCode,
    };
  
    const updatedData = {
      name,
      phone,
      email,
      address: [updatedAddress],
    };
  
    console.log("🔧 Dispatching updateUserProfile with:", updatedData);
  
    try {
      const res = await dispatch(set({ userId: user._id, updatedData }));
  
      console.log("✅ Dispatch response:", res);
  
      if (res?.payload?.updatedUser) {
        console.log("🎯 onSave about to be called with:", res.payload.updatedUser);
        onSave(res.payload.updatedUser); // Make sure this line executes
        onClose();
      } else {
        console.warn("⚠️ Update failed, success not true");
      }
    } catch (error) {
      console.error("🔥 Error in handleSave:", error);
    }
  };
  
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-[90%] max-w-xl rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Update Profile</h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full mt-1 px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          <hr className="my-4 border-gray-300" />

          <h3 className="text-lg font-semibold text-gray-700">Address</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Street</label>
              <input
                type="text"
                value={newStreet}
                onChange={(e) => setNewStreet(e.target.value)}
                placeholder="Street"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="City"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                placeholder="State"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
                placeholder="Country"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Zip Code</label>
              <input
                type="text"
                value={newZipCode}
                onChange={(e) => setNewZipCode(e.target.value)}
                placeholder="Zip Code"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
