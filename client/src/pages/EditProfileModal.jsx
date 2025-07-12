import React, { useState } from "react";
import { useUpdateUserDataMutation } from "../redux/features/auth/authApi";
import { useNavigate } from "react-router-dom";

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [updateUserData] = useUpdateUserDataMutation();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email] = useState(user?.email || "");

  const [street, setStreet] = useState(user?.address?.[0]?.street || "");
  const [city, setCity] = useState(user?.address?.[0]?.city || "");
  const [state, setState] = useState(user?.address?.[0]?.state || "");
  const [country, setCountry] = useState(user?.address?.[0]?.country || "");
  const [zipCode, setZipCode] = useState(user?.address?.[0]?.zipCode || "");

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      phone,
      address: [
        {
          label: "Primary",
          street,
          city,
          state,
          country,
          zipCode,
        },
      ],
    };

    try {
      const res = await updateUserData(payload).unwrap();
      if (res?.user) {
        onSave(res.user);
        navigate("/profile");
      } else {
        alert("Update failed.");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred while updating.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-[90%] max-w-xl">
        <h2 className="text-xl font-bold mb-4 text-center">Edit Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="border rounded p-2 w-full"
            />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="border rounded p-2 w-full"
            />
            <input
              type="email"
              value={email}
              disabled
              className="border rounded p-2 w-full bg-gray-100 text-gray-500 sm:col-span-2"
            />
          </div>

          <h3 className="font-semibold mt-4 text-gray-700">Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Street"
              className="border rounded p-2 w-full"
            />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="border rounded p-2 w-full"
            />
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
              className="border rounded p-2 w-full"
            />
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country"
              className="border rounded p-2 w-full"
            />
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Zip Code"
              className="border rounded p-2 w-full sm:col-span-2"
            />
          </div>

          <div className="flex justify-end mt-4 gap-4">
            <button type="button" onClick={onClose} className="text-gray-600">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
