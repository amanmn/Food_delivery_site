import React, { useEffect, useState } from "react";
import { addToCart } from "../redux/features/cart/cartSlice";
import { useAddItemToCartMutation } from "../redux/features/cart/cartApi";
import { useGetItemByCityQuery } from "../redux/features/product/itemApi";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { FaStar } from "react-icons/fa"
import { FaRegStar } from "react-icons/fa"

const Menu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // 🏙️ Get user's current city from Redux
  const { city } = useSelector((state) => state.user);
  const { data: itemsData, isLoading, error, refetch } = useGetItemByCityQuery(city, { skip: !city });

  const [quantities, setQuantities] = useState({});
  const [isAdding, setIsAdding] = useState({});
  const [updatedItemsList, setUpdatedItemsList] = useState([]);
  const [addItemToCart] = useAddItemToCartMutation();

  const [activeCategory, setActiveCategory] = useState("all");
  const categories = [
    "All",
    "Snacks",
    "Main Course",
    "Desserts",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "South Indian",
    "North Indian",
    "Chinese",
    "Fast Food",
    "Others",
  ];
  const handleFilterByCategory = (category) => {
    setActiveCategory(category);

    if (!Array.isArray(itemsData)) return;

    if (category === "all") {
      setUpdatedItemsList(itemsData);
    } else {
      setUpdatedItemsList(
        itemsData.filter((item) => item.category === category)
      );
    }
  };


  useEffect(() => {
    console.log("menuItems -", itemsData);
    if (itemsData && Array.isArray(itemsData)) {
      setUpdatedItemsList(itemsData);
    }
  }, [itemsData]);


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

  const handleIncreaseQuantity = (id) => {
    const newQuantity = (quantities[id] || 1) + 1;
    setQuantities((prev) => ({ ...prev, [id]: newQuantity }));
    toast.info(`Quantity updated to ${newQuantity}`);
  };

  const handleDecreaseQuantity = (id) => {
    const newQuantity = Math.max(1, (quantities[id] || 1) - 1);
    setQuantities((prev) => ({ ...prev, [id]: newQuantity }));
    toast.info(`Quantity updated to ${newQuantity}`);
  };

  // Loading / Error States
  if (!city)
    return (
      <p className="text-center text-lg font-medium text-gray-600 my-10">
        Please select your city to view available items.
      </p>
    );

  if (isLoading)
    return (
      <p className="text-center text-lg font-medium text-gray-700 my-10">
        Loading menu...
      </p>
    );

  if (error)
    return (
      <p className="text-center text-lg text-red-500 my-10">
        Failed to load menu items.
      </p>
    );

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        (i < rating)
          ? (<FaStar key={i} className='text-yellow-500 text-lg' />)
          : (<FaRegStar key={i} className='text-yellow-500 text-lg' />)
      );
    }
    return stars;
  }

  return (
    <section className="py-10 my-5 px-12 lg:px-32 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-red-500 uppercase text-lg font-bold tracking-wide">
          Our Menu
        </h3>
        <h2 className="text-5xl lg:text-5xl font-bold text-gray-900 mt-4">
          Menu That Always <br /> Makes You Fall In Love
        </h2>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mt-6">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full border transition 
                ${activeCategory === (category === "All" ? "all" : category)
                  ? "bg-red-500 text-white"
                  : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                }`}
              onClick={() =>
                handleFilterByCategory(
                  category === "All" ? "all" : category
                )
              }
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
          {updatedItemsList?.length > 0 ? (
            updatedItemsList.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-300 overflow-hidden"
              >
                <div
                  className="relative h-60 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${item.image?.startsWith("http")
                      ? item.image
                      : `${item.image ? `/` + item.image : "/placeholder-food.jpg"}`
                      })`,

                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                </div>

                <div className="p-5 flex flex-col justify-between h-48">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 truncate">
                      {item.name}
                    </h3>
                    <div className='flex flex-center gap-1 mt-1'>
                      {renderStars(0)}
                      <span className='text-xs text-gray-500'>
                        {0}
                      </span>
                    </div>
                    <p className="text-red-500 text-2xl font-bold mt-3">
                      ₹{item.price}
                    </p>
                  </div>

                  <div className="flex gap-2 items-center justify-between">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={isAdding[item._id]}
                      className={`text-white bg-red-500 hover:bg-red-600 font-semibold px-4 py-2 rounded-lg w-[60%] text-center`}
                    >
                      {isAdding[item._id] ? "Adding..." : "Add to Cart"}
                    </button>

                    <div className="flex items-center">
                      <button
                        onClick={() => handleDecreaseQuantity(item._id)}
                        className="text-white cursor-pointer font-bold px-3 py-1 bg-red-500 hover:bg-red-600 rounded-full"
                      >
                        −
                      </button>
                      <p className="text-gray-800 font-semibold w-4 text-center">
                        {quantities[item._id] || 1}
                      </p>
                      <button
                        onClick={() => handleIncreaseQuantity(item._id)}
                        className="text-white cursor-pointer font-bold px-3 py-1 bg-red-500 hover:bg-red-600 rounded-full"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-lg text-red-500 col-span-full">
              No items found in your city.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Menu;
