import React from "react";
import DeliveryBoyCard from "./DeliveryBoyCard";

const DeliveryBoyList = ({ boys }) => {
    const safeBoys = Array.isArray(boys) ? boys : [];

    return (
        <div className="mt-4 p-3 bg-white border rounded-2xl shadow-inner">
            <h3 className="font-semibold text-gray-800 mb-3 text-md">
                Nearby Delivery Boys
            </h3>

            {safeBoys.length === 0 ? (
                <p className="text-red-600 font-semibold">
                    ❌ No available delivery boys
                </p>
            ) : (
                <ul className="space-y-3">
                    {safeBoys.map((boy) => (
                        <DeliveryBoyCard key={boy._id || boy} boy={boy} />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DeliveryBoyList;
