import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetOrderByIdQuery } from '../redux/features/order/orderApi';
import { IoIosArrowRoundBack } from 'react-icons/io';
import DeliveryBoyTracking from '../../deliveryboy/DeliveryBoyTracking';

const TrackOrderPage = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const { data, isLoading, isError } = useGetOrderByIdQuery(orderId);

    useEffect(() => {
        if (data) console.log("Track order data:", data);
    }, [data]);

    if (isLoading) return <p className="text-center mt-10">Loading...</p>;
    if (isError) return <p className="text-center mt-10">Failed to load order.</p>;

    // Extracting the first shopOrder (like your screenshot)
    const shopOrder = data?.shopOrders?.[0] || {};
    const deliveryBoy = shopOrder.assignedDeliveryBoy;

    return (
        <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
            <div className='relative flex items-center gap-4 top-[20px] left-[20px] z-[10] mb-[10px]' onClick={() => navigate("/")}>
                <IoIosArrowRoundBack size={35} className='text-[#ff4d2d] cursor-pointer' />
                <h1 className="text-xl font-bold md:text-center mb-1">Track Order</h1>
            </div>

            <div className="bg-white shadow-md rounded-xl p-5">

                {/* Shop Name */}
                <h2 className="text-lg font-bold text-red-600">
                    {shopOrder.shop?.name}
                </h2>

                {/* Item Info */}
                <p className="mt-3">
                    <strong>Items:</strong> {shopOrder.shopOrderItems?.[0]?.item?.name}
                </p>

                <p>
                    <strong>Subtotal:</strong> {shopOrder.subtotal}
                </p>

                {/* Delivery Address */}
                <p className="mt-3">
                    <strong>Delivery address:</strong> {data.deliveryAddress?.text}
                </p>

                {shopOrder.status !== "delivered" ?
                    (
                        shopOrder.assignedDeliveryBoy &&
                        <div className="mt-4">
                            <p><strong>Delivery Boy Name:</strong> {deliveryBoy?.name || "Not Assigned"}</p>
                            <p><strong>Delivery Boy contact No.:</strong> {deliveryBoy?.phone || "N/A"}</p>
                        </div>
                    )
                    : <p className='text-green-600 font-semibold text-lg'>Delivered</p>
                }

                {/* MAP SECTION (Same as screenshot placeholder) */}
                {shopOrder.assignedDeliveryBoy && <DeliveryBoyTracking data={{
                    deliveryBoyLocation: { lat: deliveryBoy?.location?.lat, lon: deliveryBoy?.location?.lng },
                    customerLocation: { lat: data.deliveryAddress?.lat, lon: data.deliveryAddress?.lng },
                }} />}

            </div>
        </div>
    );
};

export default TrackOrderPage;
