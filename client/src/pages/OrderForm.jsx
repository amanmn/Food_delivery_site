import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { placeOrder } from "../redux/slices/orderSlice";

const OrderForm = () => {
  const dispatch = useDispatch();
  const { cartItems, totalAmount } = useSelector((state) => state.cart); // your cart state
  const { loading, success, error } = useSelector((state) => state.order);

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const handlePlaceOrder = () => {
    const items = cartItems.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    }));

    dispatch(placeOrder({ items, totalAmount, deliveryAddress: address }));
  };

  return (
    <div className="p-4 max-w-lg mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-2">Delivery Address</h2>

      <input type="text" placeholder="Street" onChange={(e) => setAddress({ ...address, street: e.target.value })} />
      <input type="text" placeholder="City" onChange={(e) => setAddress({ ...address, city: e.target.value })} />
      <input type="text" placeholder="State" onChange={(e) => setAddress({ ...address, state: e.target.value })} />
      <input type="text" placeholder="Zip Code" onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} />

      <button onClick={handlePlaceOrder} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
        {loading ? "Placing Order..." : "Place Order"}
      </button>

      {success && <p className="text-green-500 mt-2">Order placed successfully!</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default OrderForm;
