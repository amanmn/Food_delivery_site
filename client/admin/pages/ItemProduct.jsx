import { useDispatch, useSelector } from "react-redux";
import { Edit3, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import API from "../../src/api";
import { setMyShopData } from "../../src/redux/features/owner/ownerSlice";
import axios from "axios";

const ItemProduct = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const shopData = useSelector((state) => state.owner.myShopData);
    const shopItems = shopData?.items || [];

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        try {
            const result = await axios.delete(`${API_URL}/api/item/delete-item/${itemId}`,
                { withCredentials: true })
            dispatch(setMyShopData(result.data));
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="min-h-screen bg-white py-10 px-4 sm:px-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    🍽️ Manage Your Menu
                </h2>
                <p className="text-gray-600 text-sm sm:text-base text-center sm:text-right max-w-md">
                    Edit or update your delicious dishes anytime with ease.
                </p>
            </div>

            {/* Food Grid */}
            {shopItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    {shopItems.map((item) => (
                        <div
                            key={item._id}
                            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-300"
                        >
                            {/* Image */}
                            <div className="w-full h-48 overflow-hidden">
                                <img
                                    src={item.image || "https://source.unsplash.com/400x300/?food"}
                                    alt={item.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            {/* Info */}
                            <div className="p-4 space-y-3 flex flex-col justify-between h-[190px]">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                                            {item.name}
                                        </h3>
                                        <span
                                            className={`text-xs font-medium px-2 py-1 rounded-full ${item.available
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {item.available ? "Available" : "Sold Out"}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-500 mb-1">
                                        {item.category || "Uncategorized"}
                                    </p>

                                    <p className="text-base font-semibold text-orange-600">
                                        ₹{item.price || 0}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between gap-3">
                                    <button
                                        onClick={() => navigate(`/edit-item/${item._id}`)}
                                        className="flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer font-medium bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition"
                                    >
                                        <Edit3 size={14} />
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDeleteItem(item._id)}
                                        className="flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer font-medium bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col h-100 gap-8 justify-center items-center text-center">
                    <p className="text-gray-700 text-3xl font-medium">
                        No food items added yet. Start adding now 🍕
                    </p>
                    <button
                        onClick={() => navigate("/add-food-item")}
                        className="flex items-center text-blue-100 bg-blue-500 gap-1 p-2 text-2xl font-bold cursor-pointer rounded-xl">
                        <FaPlus size={20} />
                        <span >Add food item</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ItemProduct;
