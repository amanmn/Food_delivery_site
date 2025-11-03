import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import GetAddressModel from "../components/cartAddressModel";
import { updateUserProfile } from "../redux/features/user/userSlice";
import { useUpdateUserDataMutation } from "../redux/features/user/userApi";
import { usePlaceOrderMutation } from "../redux/features/order/orderApi";
import { motion } from "framer-motion";
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoLocationSharp } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";



const Cart = () => {
    const [placeOrder] = usePlaceOrderMutation();
    const [updateUserData] = useUpdateUserDataMutation();

    const [cartItems, setCartItems] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);

    // useEffect(() => {
    //     setCartItems(data?.items || []);
    //     console.log(cartItems);
    // }, []);

    useEffect(() => {
        if (!user) return;
        if (!selectedAddressId && Array.isArray(user.address) && user.address.length > 0) {
            setSelectedAddressId(user.address[0]._id);
        }
    }, [user, selectedAddressId]);

    const handlePlaceOrder = async () => {
        const selectedAddress = user?.address?.find((addr) => addr._id === selectedAddressId);

        if (!selectedAddress) {
            toast.error("Please select or add an address to proceed.");
            return;
        }

        const orderItems = cartItems
            .filter((item) => item?.product?._id)
            .map((item) => ({
                product: item.product._id,
                quantity: item.quantity,
            }));

        const orderPayload = {
            userId: user?._id,
            items: orderItems,
            totalAmount: calculateTotal(),
            address: selectedAddress,
        };

        try {
            const result = await placeOrder(orderPayload).unwrap();
            if (result.success) toast.success("Order placed successfully!");
            setCartItems([]);
            navigate("/");
        } catch (error) {
            console.error(error);
            toast.error("Failed to place order.");
        }
    };


    const handleSaveAddress = async (newAddress) => {
        try {
            const res = await updateUserData({ newAddress }).unwrap();
            const updatedUser = res.user || res;
            dispatch(updateUserProfile(updatedUser));

            const lastAddress = updatedUser.address.at(-1);
            if (lastAddress) setSelectedAddressId(lastAddress._id);

            toast.success("New address added!");
            setIsAddressModalOpen(false);
        } catch {
            toast.error("Failed to add address.");
        }
    };

    const calculateTotal = () =>
        cartItems.reduce((t, i) => t + i.quantity * (i?.product?.price || 0), 0);

    const selectedAddress = user?.address?.find((a) => a._id === selectedAddressId);

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white px-4 py-8 flex justify-center">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl bg-white shadow-2xl  rounded-3xl p-6 md:p-10 border border-gray-100"
            >
                <div className="flex items-center">
                    <button
                        onClick={() => navigate("/cart")}
                        className="  bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 cursor-pointer rounded-lg transition-all"
                    >
                        <IoIosArrowRoundBack size={35} />
                    </button>
                    <h1 className="text-lg md:text-2xl px-6 font-semibold text-gray-800">
                        Checkout
                    </h1>
                </div>

                {/* <div className="grid gap-6">
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
                </div> */}

                {/* Address Section */}
                <div className="mt-8">
                    <h3 className="text-xl flex font-semibold text-gray-800 mb-3 ">
                        <IoLocationSharp className="text-red-500 mt-1 mr-3" />
                        Delivery Address
                    </h3>
                    <div className="flex gap-2 mb-3">
                        <input type="text" placeholder="Enter Your Delivery Address..." className="w-full flex-1 p-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                        <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer"><IoSearchOutline size={17} /></button>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center"><TbCurrentLocation size={17} /></button>
                    </div>
                    <div>Map</div>


                    {Array.isArray(user?.address) && user.address.length > 0 ? (
                        <select
                            className="w-full cursor-pointer border border-gray-300 p-2 rounded-lg text-gray-700 shadow-sm"
                            value={selectedAddressId}
                            onChange={(e) => setSelectedAddressId(e.target.value)}
                        >
                            {user.address.map((addr) => (
                                <option key={addr._id} value={addr._id}>
                                    {addr.street}, {addr.city}, {addr.state}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <p className="text-gray-600">No address found. Please add one.</p>
                    )}

                    <button
                        onClick={() => setIsAddressModalOpen(true)}
                        className="w-full mt-3 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-all"
                    >
                        {user?.address?.length > 0 ? "Add Another Address" : "Enter Address"}
                    </button>

                    {selectedAddress && (
                        <div className="mt-4 bg-gray-50 border rounded-xl p-4">
                            <h4 className="font-semibold text-gray-800 mb-1">
                                Selected Address:
                            </h4>
                            <p className="text-gray-600 text-sm">
                                {selectedAddress.street}, {selectedAddress.city},{" "}
                                {selectedAddress.state}, {selectedAddress.country} -{" "}
                                {selectedAddress.zipCode}
                            </p>
                        </div>
                    )}

                    {isAddressModalOpen && (
                        <GetAddressModel
                            onClose={() => setIsAddressModalOpen(false)}
                            onSave={handleSaveAddress}
                        />
                    )}
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
            </motion.div>
        </div >
    );
};

export default Cart;
