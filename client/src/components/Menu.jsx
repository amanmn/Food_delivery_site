import React, { useEffect, useState } from "react";
import { addToCart } from "../redux/features/cart/cartSlice";
import { useAddItemToCartMutation, useUpdateCartItemMutation } from "../redux/features/cart/cartApi";
import { useGetProductDataQuery } from "../redux/features/product/productApi";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

const Menu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [quantities, setQuantities] = useState({});
  const [isAdding, setIsAdding] = useState({});

  const [addItemToCart] = useAddItemToCartMutation();
  const [updateCartItem] = useUpdateCartItemMutation();

  const { data: menuData, isLoading, error } = useGetProductDataQuery();

  const handleAddToCart = async (item) => {
    const quantity = quantities[item._id] || 1;

    try {
      setIsAdding((prev) => ({ ...prev, [item._id]: true }));

      const res = await addItemToCart({ productId: item._id, quantity }).unwrap();

      dispatch(addToCart({ ...item, quantity }));
      toast.success("Item added to cart!");
    } catch (error) {
      const status = error?.status;
      const message = error?.data?.message || "Failed to add item to cart";

      // ✅ If user is unauthorized (no cookie or expired token)
      if (status === 401 || status === 403) {
        toast.error("Session expired. Please login again.");
        navigate("/login", { state: { from: location.pathname } });
      } else {
        toast.error(message);
      }
    } finally {
      setIsAdding((prev) => ({ ...prev, [item._id]: false }));
    }
  };

  const handleIncreaseQuantity = async (id) => {
    const newQuantity = (quantities[id] || 1) + 1;
    setQuantities((prev) => ({ ...prev, [id]: newQuantity }));

    try {
      toast.success(`quantity updated to ${newQuantity}`);
    } catch {
      toast.error("Failed to update quantity!");
    }
  };

  const handleDecreaseQuantity = async (id) => {
    const newQuantity = Math.max(1, (quantities[id] || 1) - 1);
    setQuantities((prev) => ({ ...prev, [id]: newQuantity }));

    try {
      toast.success(`quantity updated to ${newQuantity}`);
    } catch {
      toast.error("Failed to update quantity!");
    }
  };

  if (isLoading) return <p className="text-center text-lg font-medium">Loading menu...</p>;
  if (error) return <p className="text-center text-lg text-red-500">Failed to load menu items.</p>;

  return (
    <section className="py-24 my-5 px-12 lg:px-32 bg-grey-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-red-500 uppercase text-lg font-bold tracking-wide">Our Menu</h3>
        <h3 className="text-5xl lg:text-5xl font-bold text-gray-900 mt-4">
          Menu That Always <br /> Makes You Fall In Love
        </h3>

        <div className="relative overflow-x-auto scrollbar-hide mt-4">
          <div className="flex br-15 space-x-8 px-6 lg:px-0 whitespace-nowrap">
            {menuData?.length > 0 ? (
              menuData.map((item) => (
                <div key={item._id} className="min-w-[350px] lg:min-w-[350px]">
                  <div
                    className="relative bg-cover bg-center h-72 lg:h-90 rounded-xl shadow-xl hover:scale-105 transition-transform duration-300"
                    style={{ backgroundImage: `url(${item.image || item.images?.[0]})` }}
                  >
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent to-transparent p-6 rounded-b-xl">
                      <h3 className="font-bold text-xl">{item.name}</h3>
                      <p className="text-red-00 text-2xl font-bold mt-2">₹{item.price}</p>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between mt-2">
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={isAdding[item._id]}
                            className="text-white bg-orange-500 hover:bg-orange-600 font-semibold px-4 py-2 rounded-lg"
                          >
                            {isAdding[item._id] ? "Adding..." : "Add to Cart"}
                          </button>

                          <div className="flex items-center">
                            <button
                              onClick={() => handleDecreaseQuantity(item._id)}
                              className="text-white cursor-pointer font-bold px-3 py-1 bg-orange-500 hover:bg-orange-600 rounded-full"
                            >
                              -
                            </button>
                            <p className="text-white font-bold mx-4">{quantities[item._id] || 1}</p>
                            <button
                              onClick={() => handleIncreaseQuantity(item._id)}
                              className="text-white cursor-pointer font-bold px-3 py-1 bg-orange-500 hover:bg-orange-600 rounded-full"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-lg text-red-500">No items found</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Menu;
