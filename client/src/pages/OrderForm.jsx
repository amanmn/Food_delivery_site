import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { placeOrder } from "../redux/features/order/orderSlice";
import { updateSelectedAddress } from "../redux/features/user/userSlice";
const OrderForm = () => {
  const dispatch = useDispatch();
  const { cartItems, totalAmount } = useSelector((state) => state.cart); // your cart state
  const { loading, success, error } = useSelector((state) => state.order);
  const { userAddress } = useSelector((state) => state.user);

  const handlePlaceOrder = () => {
    const items = cartItems.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    }));

    dispatch(placeOrder({ items, totalAmount, userAddress }));
  };

  return (
    <div className="p-4 max-w-lg mx-auto bg-white shadow rounded">
      <button onClick={handlePlaceOrder} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
        {loading ? "Placing Order..." : "Place Order"}
      </button>

      {success && <p className="text-green-500 mt-2">Order placed successfully!</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default OrderForm;
