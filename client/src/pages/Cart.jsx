import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { updateUserProfile } from "../redux/features/auth/authSlice";
import { useSelector, useDispatch } from "react-redux";
import GetAddressModel from "../components/cartAddressModel";
import {
  useUpdateUserDataMutation,
} from "../redux/features/auth/authApi";
import {
  useGetCartItemsQuery,
  useUpdateCartItemMutation,
  useDeleteCartItemMutation,
} from "../redux/features/cart/cartApi";
import { usePlaceOrderMutation } from "../redux/features/order/orderApi";

const Cart = () => {
  const [placeOrder] = usePlaceOrderMutation();
  const { data, error, isLoading } = useGetCartItemsQuery();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [cartItems, setCartItems] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [updateUserData] = useUpdateUserDataMutation();
  const [deleteCartItem] = useDeleteCartItemMutation();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user?.address?.length === 1) {
      setSelectedAddressId(user.address[0]._id);
    }
    setCartItems(data?.items || []);
  }, [data, user?.address]);

  const handlePlaceOrder = async () => {
    const selectedAddress = user?.address?.find(
      (addr) => addr._id === selectedAddressId
    );

    if (!selectedAddress) {
      toast.error("Please select or add an address to proceed.");
      return;
    }

    const orderItems = cartItems
      .filter((item) => item?.product?._id)
      .map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      }));

    const orderPayload = {
      userId: user?._id,
      items: orderItems,
      totalAmount: calculateTotal(),
      address: selectedAddress,
    };

    try {
      const result = await placeOrder(orderPayload).unwrap();
      if(result.success)
      toast.success("Order placed successfully!");
      setCartItems([]);
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order.");
    }
  };

  const handleQuantityChange = async (itemId, delta) => {
    const updatedItems = cartItems.map((item) => {
      if (item._id === itemId) {
        const MIN_QUANTITY = 1;
        const newQuantity = Math.max(MIN_QUANTITY, item.quantity + delta);
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

  const handleRemoveItem = async (itemId) => {
    try {
      await deleteCartItem(itemId).unwrap();
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));
      toast.success("Item removed from cart");
    } catch (err) {
      console.error("Remove item error:", err);
      toast.error("Failed to remove item");
    }
  };

  const handleSaveAddress = async (newAddress) => {
    try {
      const payload = { newAddress }; // no userId
      const res = await updateUserData(payload).unwrap();
      const updatedUser = res.user // depends on your API response shape
        ? res.user
        : res; // fallback if response is directly user object

      dispatch(updateUserProfile(updatedUser));

      const lastAddr = updatedUser.address.at(-1);

      if (lastAddr) setSelectedAddressId(lastAddr._id);
      toast.success("New address added!");
      setIsAddressModalOpen(false);
    } catch (err) {
      console.error("Error while adding address:", err);
      toast.error("Failed to add new address.");
    }
  };


  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item?.product?.price || 0;
      return total + item.quantity * price;
    }, 0);
  };

  if (error) {
    return (
      <p className="text-red-500 text-center mt-10 text-sm md:text-base">
        {error.message || "Error fetching cart data. Please try again."}
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="text-center text-red-500 mt-10 text-sm md:text-base">
        Loading data...
      </p>
    );
  }

  const selectedAddress = user?.address?.find((addr) => addr._id === selectedAddressId);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 mx-auto w-full max-w-5xl bg-white shadow-2xl rounded-2xl mt-10">
      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500 py-6 text-base sm:text-lg">
          Your cart is empty. Add some delicious food to proceed!
        </p>
      ) : (
        cartItems.map((item) => (
          <div
            key={item._id}
            className="flex flex-col md:flex-row items-center gap-4 p-4 mb-4 rounded-2xl shadow-sm border bg-white hover:shadow-lg transition-all duration-200"
          >
            {/* Product Image */}
            <div className="w-full md:w-1/5 flex justify-center">
              <img
                src={item?.product?.image || "https://via.placeholder.com/150"}
                alt={item?.product?.name}
                className="w-28 h-28 object-cover rounded-xl"
              />
            </div>

            {/* Product Details */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {item?.product?.name || "No name"}
              </h3>
              <p className="text-gray-600 mt-1 text-sm">
                ₹{item?.product?.price || 0}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Quantity: {item.quantity}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-end">
              <div className="flex items-center gap-2 border rounded-md px-2 py-1">
                <button
                  onClick={() => handleQuantityChange(item._id, -1)}
                  className="text-gray-700 text-lg font-bold hover:text-black"
                >
                  −
                </button>
                <span className="px-2">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item._id, 1)}
                  className="text-gray-700 text-lg font-bold hover:text-black"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => handleRemoveItem(item._id)}
                className="text-sm text-red-500 hover:text-red-700 transition"
              >
                Remove
              </button>
            </div>

          </div>
        )))}


      {/* Address Section */}
      <div className="mb-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Delivery Address</h3>

        <div className="flex flex-col gap-3">
          {user?.address?.length > 0 ? (
            <select
              className="w-full border border-gray-300 p-2 rounded"
              value={selectedAddressId}
              onChange={(e) => setSelectedAddressId(e.target.value)}
            >
              <option value="" disabled>Select an address</option>
              {user.address.map((addr) => (
                <option key={addr._id} value={addr._id}>
                  {addr.street}, {addr.city}, {addr.state}, {addr.zipCode}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-600">No address found. Please add one.</p>
          )}

          <button
            onClick={() => setIsAddressModalOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {user?.address?.length > 0 ? "Add Another Address" : "Enter Address"}
          </button>
        </div>

        {selectedAddress && (
          <div className="p-4 border rounded shadow bg-white mt-4">
            <h4 className="text-md font-semibold text-gray-800 mb-1">Selected Address:</h4>
            <p className="text-gray-600">
              {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.country} - {selectedAddress.zipCode}
            </p>
          </div>
        )}

        {isAddressModalOpen && (
          <GetAddressModel
            onClose={() => setIsAddressModalOpen(false)}
            onSave={handleSaveAddress}
          />
        )}
      </div>

      {/* Total + Checkout */}
      <div className="border-t pt-6">
        {cartItems.length > 0 ? (
          <>
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
          </>
        ) : (
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-500 text-white font-semibold py-3 text-base sm:text-lg rounded-xl hover:bg-blue-600 transition-all"
          >
            Browse Menu
          </button>
        )}
      </div>
    </div>
  );
};

export default Cart;
