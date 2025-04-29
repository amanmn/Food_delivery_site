import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { updateUserProfile } from "../redux/features/auth/authSlice";
import { useSelector, useDispatch } from "react-redux";
import GetAddressModel from "../components/cartAddressModel";
import { useUpdateUserDataMutation } from "../redux/features/auth/authApi";
import { useGetCartItemsQuery, useUpdateCartItemMutation } from "../redux/features/cart/cartApi";
import { usePlaceOrderMutation } from "../redux/features/order/orderApi";

const Cart = () => {
  const [placeOrder] = usePlaceOrderMutation();
  const { data, error, isLoading } = useGetCartItemsQuery();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [cartItems, setCartItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [updateUserData] = useUpdateUserDataMutation();

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user); // adjust to your user slice

  useEffect(() => {
    if (data && data.items && data.items.length > 0) {
      setCartItems(data.items);
    } else {
      setCartItems([]); // Set cart items to an empty array if no data found
    }
  
    console.log(user);
  }, [data, user]);

  const handlePlaceOrder = async () => {
    if (!user?.address?.length) {
      toast.error("No address selected. Please add an address to proceed.");
      return;
    }

    const orderItems = cartItems.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,      
    }));

    const orderPayload = {
      userId: user._id,
      items: orderItems,
      totalAmount: calculateTotal(),
      address: selectedAddress,
    };

    try {
      const res = await placeOrder(orderPayload).unwrap();
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order.");
    }
  };

  const handleQuantityChange = async (itemId, delta) => {
    const updatedItems = cartItems.map((item) => {
      if (item._id === itemId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedItems);

    const updatedItem = updatedItems.find((item) => item._id === itemId);
    try {
      await updateCartItem({ itemId, quantity: updatedItem.quantity }).unwrap();
      toast.success("Quantity updated successfully");
    } catch (error) {
      toast.error("Failed to update quantity");
      console.error(error);
    }
  };

  const handleSaveAddress = async (newAddress) => {
    try {
      const addressPayload = {
        userId: user._id,
        newAddress,
      };

      const updatedUser = await updateUserData(addressPayload).unwrap();
      console.log("Updated User with new address:", updatedUser);

      dispatch(updateUserProfile(updatedUser));

      toast.success("New address added successfully!");
      setIsAddressModalOpen(false);
    } catch (err) {
      console.error("Error while adding address:", err);
      toast.error("Failed to add new address.");
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.quantity * item.product.price,
      0
    );
  };

  if (error)
    return (
      <p className="text-red-500 text-center mt-10 text-sm md:text-base">
        {error.message || "Error fetching cart data. Please try again."}
        </p>
    );
  if (isLoading)
    return (
      <p className="text-center text-red-500 mt-10 text-sm md:text-base">
        Loading data...
      </p>
    );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 mx-auto w-full max-w-5xl bg-white shadow-2xl rounded-2xl mt-10">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 text-gray-800 text-center sm:text-left">
        Shopping Cart
      </h2>
      <p className="text-sm sm:text-md lg:text-lg text-gray-600 mb-6 text-center sm:text-left">
        {cartItems.length === 0 ? "No items in your cart" : `${cartItems.length} items`}
      </p>

      <hr className="mb-6 border-gray-300" />

      {/* Check if no cart items */}
      {cartItems.length === 0 ? (
        <p className="text-center text-gray-600 mt-6">Your cart is empty. Add items to proceed.</p>
      ) : (
        // Responsive Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mb-10">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex flex-col bg-gray-50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <img
                src={item.product.image || "/placeholder.png"}
                alt={item.product.name}
                className="w-90 h-65 object-cover  duration-500 hover:scale-104 rounded-lg border border-gray-200 mb-4"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div className="mb-3">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
                    {item.product.name}
                  </h3>
                  <p className="text-md sm:text-md text-gray-600 mb-1">
                    {item.product.description}
                  </p>
                  <p className="text-md sm:text-md text-gray-600">
                    Category: {item.product.category}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg sm:text-xl font-bold text-gray-800">
                    ₹{item.product.price}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item._id, -1)}
                      className="px-2 sm:px-3 py-1 bg-gray-200 hover:bg-gray-300 text-lg rounded"
                    >
                      -
                    </button>
                    <span className="text-md font-medium text-gray-700">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item._id, 1)}
                      className="px-2 sm:px-3 py-1 bg-gray-200 hover:bg-gray-300 text-lg rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* address fields */}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Delivery Address</h3>

        <div className="mb-6">
          {user?.address?.length > 1 ? (
            // Case: Multiple addresses => show dropdown
            <select
              className="w-full border border-gray-300 p-2 rounded"
              onChange={(e) => setSelectedAddress(JSON.parse(e.target.value))}
              defaultValue=""
            >
              <option value="" disabled>Select an address</option>
              {user.address.map((addr, i) => (
                <option key={i} value={JSON.stringify(addr)}>
                  {addr.street}, {addr.city}, {addr.state}
                </option>
              ))}
            </select>
          ) : user?.address?.length === 1 ? (
            // Case: Only one address => auto-select it
            <div className="p-4 border rounded bg-gray-100">
              <p className="text-gray-700 font-medium">
                {user.address[0].street}, {user.address[0].city}, {user.address[0].state}
              </p>
              <button
                onClick={() => setSelectedAddress(user.address[0])}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Deliver to this Address
              </button>
            </div>
          ) : (
            // Case: No address => show Enter Address button
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Enter Address
            </button>
          )}
        </div>

        {/* Show Selected Address Card */}
        {selectedAddress && (
          <div className="p-4 border rounded shadow bg-white mt-4">
            <h4 className="text-md font-semibold text-gray-800 mb-1">Selected Address:</h4>
            <p className="text-gray-600">
              {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.country} - {selectedAddress.zipCode}
            </p>
          </div>
        )}

        {/* Address Modal */}
        {isAddressModalOpen && (
          <GetAddressModel
            onClose={() => setIsAddressModalOpen(false)}
            onSave={handleSaveAddress}
          />
        )}
      </div>

      {/* Total + Checkout */}
      <div className="border-t pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-lg sm:text-xl font-bold text-gray-800 mb-4 gap-2">
          <span>Total</span>
          <span>₹{calculateTotal()}</span>
        </div>

        <button
          onClick={handlePlaceOrder}
          className="w-full bg-orange-500 text-white font-semibold py-3 text-base sm:text-lg rounded-xl hover:bg-orange-600 transition-all"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
