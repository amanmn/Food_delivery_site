import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  useGetCartItemsQuery,
  useUpdateCartItemMutation,
  useDeleteCartItemMutation,
} from "../redux/features/cart/cartApi";
import { motion } from "framer-motion";
import { CiTrash } from "react-icons/ci"
import { FaBoxArchive, FaMinus, FaPlus } from "react-icons/fa6";
import { BsCart4 } from "react-icons/bs";

const Cart = () => {
  const { data, isLoading } = useGetCartItemsQuery();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [deleteCartItem] = useDeleteCartItemMutation();

  const [cartItems, setCartItems] = useState([]);

  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const items = data?.items || [];
    setCartItems(items);
  }, [data]);

  useEffect(() => {
    if (!user) return;
  }, [user]);

  const handlePlaceOrder = async () => {
    navigate("/checkout")
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
      toast.success("Quantity updated");
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await deleteCartItem(itemId).unwrap();
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const calculateTotal = () =>
    cartItems.reduce((t, i) => t + i.quantity * (i?.product?.price || 0), 0);

  if (isLoading)
    return (
      <p className="text-center text-red-500 mt-10 animate-pulse">Loading...</p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white px-4 py-8 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl p-6 md:p-10 border border-gray-100"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl flex gap-2 md:text-3xl font-bold text-gray-800">
            <BsCart4 className="mt-1" /> <span>Your Cart</span>
          </h2>
          <button
            onClick={() => navigate("/")}
            className="text-sm md:text-base bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 cursor-pointer rounded-lg transition-all"
          >
            Go Back Home
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <p className="text-gray-500 flex justify-end text-lg mb-6">
              Your cart is empty <span><FaBoxArchive size={25} className="mr-5" /></span>  Let’s find something tasty!
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-600 transition-all shadow-md"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {cartItems.map((item) => (
                <motion.div
                  key={item._id}
                  whileHover={{ scale: 1.02 }}
                  className="flex flex-col sm:flex-row items-center gap-5 p-4 sm:p-5 rounded-2xl border bg-white/70 shadow-md hover:shadow-xl transition-all"
                >
                  <img
                    src={item?.product?.image || "https://via.placeholder.com/150"}
                    alt={item?.product?.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-xl"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                      {item?.product?.name}
                    </h3>
                    <p className="text-gray-800 mt-1 font-bold text-sm sm:text-base">
                      ₹{item?.product?.price}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="flex items-center gap-3 rounded-lg px-3 py-1.5 shadow-sm">
                      <button
                        onClick={() => handleQuantityChange(item._id, -1)}
                        className="text-sm text-gray-700 hover:text-black cursor-pointer"
                      >
                        <FaMinus />
                      </button>
                      <span className="text-gray-800 font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item._id, 1)}
                        className="text-sm text-gray-700 hover:text-black cursor-pointer"
                      >
                        <FaPlus />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="text-sm p-1 bg-red-100 text-red-500 hover:bg-red-200 font-medium cursor-pointer rounded-full"
                    >
                      <CiTrash size={25} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Total + Checkout */}
            <div className="border-t mt-10 pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xl font-bold text-gray-800">
                Total: ₹{calculateTotal()}
              </span>
              <button
                onClick={handlePlaceOrder}
                className="bg-orange-500 cursor-pointer text-white font-semibold py-3 px-8 rounded-xl hover:bg-orange-600 transition-all shadow-md"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Cart;
