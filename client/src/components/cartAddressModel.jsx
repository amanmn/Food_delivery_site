import React, { useState, useRef, useEffect } from "react";

const EnterAddressModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });

  const streetRef = useRef(null);

  useEffect(() => {
    streetRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-opacity-60 backdrop-blur-sm flex items-start justify-center pt-1 z-50">
      <div className="bg-gray-900 p-8 rounded-lg shadow-2xl w-full max-w-md h-screen sm:h-auto sm:max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Add New Address</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Label</label>
            <select
              name="label"
              value={formData.label}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Street */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Street</label>
            <input
              ref={streetRef}
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Zip Code */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Zip Code</label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnterAddressModal;
