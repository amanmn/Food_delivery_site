import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMapMarkerAlt, FaStore, FaPhoneAlt, FaEnvelope, FaRegEdit } from "react-icons/fa";
import { useEffect } from "react";
import { useGetMyShopQuery } from "../../src/redux/features/shop/shopApi";

const MyShop = () => {
    const navigate = useNavigate();
    const { data: shopData, isLoading, isError } = useGetMyShopQuery();

    useEffect(() => {
        if (shopData) {
            console.log("My shop data:", shopData);
        }
        if (isError) {
            console.error("Failed to fetch shop:");
        }
    }, [shopData, isError]);


    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-gray-600 text-lg font-medium">
                Loading shop details...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-500 text-lg font-medium">
                Failed to load shop details. Please try again later.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center py-10 px-4 sm:px-8 lg:px-16">

            {/* Header Section */}
            <div className="w-full max-w-5xl flex justify-between items-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <FaStore className="text-blue-600" /> My Shop Details
                </h1>
                <div className="flex">
                    <button
                        onClick={() => navigate("/create-edit-shop")}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition-all duration-200"
                    >
                        <FaRegEdit /> Edit Shop
                    </button>
                    <button
                        onClick={() => navigate("/dash")}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition-all duration-200"
                    >
                        <FaArrowLeft /> Go Back
                    </button>
                </div>
            </div>

            {/* Shop Card */}
            {shopData ? (
                <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <div className="relative">
                        <img
                            src={shopData?.image || "https://source.unsplash.com/800x400/?shop,store"}
                            alt={shopData?.name}
                            className="w-full h-84 object-contain"
                        />
                        <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full shadow">
                            {shopData?.status || "Active"}
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">{shopData.name}</h2>
                        <p className="text-gray-600 text-base leading-relaxed">
                            {shopData?.description || "No description provided for this shop."}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            <div className="flex items-center gap-3 text-gray-700">
                                <FaMapMarkerAlt className="text-blue-600" />
                                <span>{shopData?.address || "Location not specified"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <FaPhoneAlt className="text-green-600" />
                                <span>{shopData?.owner?.phone || "No contact number"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <FaEnvelope className="text-pink-600" />
                                <span>{shopData?.owner?.email || "No email available"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <FaStore className="text-purple-600" />
                                <span>{shopData.category || "Restaurent"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-gray-500 text-sm mt-10">No shop added yet.</p>
            )}
        </div>
    );
};

export default MyShop;
