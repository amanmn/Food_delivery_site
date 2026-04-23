import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useSearchItemsQuery } from "../redux/features/product/itemApi";
import { setSearchQuery } from "../redux/features/user/userSlice";

const SearchedItems = ({ onClick }) => {
    const city = useSelector((state) => state.user.city);
    const searchQuery = useSelector((state) => state.user.searchQuery);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
    }, [searchQuery]);

    const handleClick = (item) => {
        console.log("CLICKED:", item._id);

        // 🔥 close search FIRST
        onClick?.();
        dispatch(setSearchQuery("")); // Clear search query in Redux
        navigate(`/product/${item._id}`);
    };

    const {
        data: updatedItemsList = [],
        isLoading,
    } = useSearchItemsQuery(
        { query: searchQuery, city },
        {
            skip: !city || !debouncedQuery || debouncedQuery.length < 2,
        }
    );

    return (
        <>
            {isLoading && (
                <div className="grid grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-xl" />
                    ))}
                </div>
            )}

            {/* 🔥 YOUR GRID (UNCHANGED) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
                {debouncedQuery.length >= 2 && !isLoading && updatedItemsList?.length > 0 ? (
                    updatedItemsList.map((item) => (
                        <div
                            onClick={() => handleClick(item)}
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
                                    <p className="text-red-500 text-2xl font-bold mt-3">
                                        ₹{item.price}
                                    </p>
                                </div>

                                {/* <div className="flex gap-2 items-center justify-between">
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
                                </div> */}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-lg text-red-500 col-span-full">
                        No results found
                    </p>
                )}
            </div>
        </>
    );
};

export default SearchedItems;
