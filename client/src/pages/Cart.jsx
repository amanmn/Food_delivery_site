// components/Cart.jsx
import React from "react";
import { useGetCartItemsQuery } from "../redux/features/cart/cartApi"; // Adjust path if needed

const Cart = () => {
  const { data: cartItems, error, isLoading } = useGetCartItemsQuery();
  if (error) return <p className="text-red-500">{error.message}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Cart</h2>
      {cartItems?.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <ul className="space-y-3">
          {cartItems?.map((item) => (
            <li key={item._id} className="border p-3 rounded">
              <p><strong>{item.product.name}</strong></p>
              <p>Quantity: {item.quantity}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cart;
