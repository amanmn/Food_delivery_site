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
import { CiTrash } from "react-icons/ci";
import { FaBoxArchive, FaMinus, FaPlus } from "react-icons/fa6";
import { BsCart4 } from "react-icons/bs";

const Cart = () => {
  const { data, isLoading } = useGetCartItemsQuery();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [deleteCartItem] = useDeleteCartItemMutation();

  const [cartItems, setCartItems] = useState([]);

  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    const items = data?.items || [];
    setCartItems(items);
  }, [data]);

  useEffect(() => {
    if (!user) return;
  }, [user]);

  const handlePlaceOrder = async () => {
    navigate("/checkout");
  };

  const handleQuantityChange = async (itemId, delta) => {
    const previousItems = cartItems;
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
      setCartItems(previousItems);
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
      <div className="min-h-screen flex items-center justify-center bg-[#fff7f1]">
        <div className="flex items-center gap-3 text-[#ff6b35] font-semibold">
          <span className="h-3 w-3 rounded-full bg-[#ff6b35] animate-ping" />
          <span className="animate-pulse">Loading your cart…</span>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fff7f1] relative overflow-hidden px-3 sm:px-6 py-6 sm:py-10 flex justify-center">
     
      <div className="pointer-events-none absolute -top-32 -left-20 w-[420px] h-[420px] rounded-full bg-[#ff6b35]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 w-[420px] h-[420px] rounded-full bg-[#e84393]/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-5xl bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(255,107,53,0.35)] rounded-3xl p-5 sm:p-8 md:p-10 border border-white"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-[#ff6b35] via-[#f7931e] to-[#e84393] text-white grid place-items-center shadow-lg shadow-[#ff6b35]/30">
              <BsCart4 size={22} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                Your Cart
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"} • ready when you are
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="self-start sm:self-auto text-sm md:text-base bg-white hover:bg-[#fff1e8] text-[#ff6b35] font-semibold px-4 py-2 cursor-pointer rounded-full transition-all border border-[#ff6b35]/30 shadow-sm"
          >
            ← Continue shopping
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#ff6b35]/10 to-[#e84393]/10 grid place-items-center mb-5">
              <FaBoxArchive size={38} className="text-[#ff6b35]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mt-2 mb-6 max-w-sm">
              Nothing here yet — let's find something delicious to fill it up.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white font-semibold px-7 py-3 rounded-full hover:brightness-110 transition-all shadow-lg shadow-[#ff6b35]/40"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {cartItems.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  whileHover={{ y: -2 }}
                  className="group flex flex-col sm:flex-row items-center gap-4 sm:gap-5 p-3 sm:p-4 rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_30px_-12px_rgba(255,107,53,0.35)] hover:border-[#ff6b35]/30 transition-all"
                >
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b35]/20 to-[#e84393]/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition" />
                    <img
                      src={item?.product?.image || "https://via.placeholder.com/150"}
                      alt={item?.product?.name}
                      className="relative w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl ring-2 ring-white"
                    />
                  </div>

                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                      {item?.product?.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Freshly prepared</p>
                    <p className="mt-2 font-extrabold text-lg bg-gradient-to-r from-[#ff6b35] to-[#e84393] bg-clip-text text-transparent">
                      ₹{item?.product?.price}
                    </p>
                  </div>

                  <div className="flex flex-row gap-3 items-center">
                    <div className="flex items-center gap-3 rounded-full px-3 py-2 bg-[#fff1e8] border border-[#ff6b35]/20">
                      <button
                        onClick={() => handleQuantityChange(item._id, -1)}
                        className="h-7 w-7 grid place-items-center rounded-full bg-white text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white transition cursor-pointer shadow-sm"
                        aria-label="Decrease"
                      >
                        <FaMinus size={10} />
                      </button>
                      <span className="text-gray-900 font-bold min-w-[1.25rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item._id, 1)}
                        className="h-7 w-7 grid place-items-center rounded-full bg-white text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white transition cursor-pointer shadow-sm"
                        aria-label="Increase"
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="h-10 w-10 grid place-items-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition cursor-pointer"
                      aria-label="Remove"
                    >
                      <CiTrash size={22} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-8 rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-[#fff1e8] via-white to-[#ffe4ef] border border-[#ff6b35]/15">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    Order total
                  </p>
                  <p className="mt-1 text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#ff6b35] via-[#f7931e] to-[#e84393] bg-clip-text text-transparent">
                    ₹{calculateTotal()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Taxes & delivery calculated at checkout
                  </p>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#ff6b35] to-[#e84393] cursor-pointer text-white font-bold py-3.5 px-8 rounded-full hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#ff6b35]/40"
                >
                  Proceed to Checkout →
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Cart;
