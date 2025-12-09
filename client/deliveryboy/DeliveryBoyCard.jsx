import React, { useEffect } from "react";

const DeliveryBoyCard = ({ boy }) => {

    useEffect(() => {
        console.log("DeliveryBoyCard", boy);
    }, [boy])
    return (
        <li className="p-3 bg-gray-50 border rounded-xl shadow-sm flex flex-col gap-1">
            <span className="font-bold text-gray-800">{boy.fullName}</span>
            <span className="text-gray-700">📞 {boy.phone}</span>
            <span className="text-gray-600 text-sm">
                📍 {boy.latitude}, {boy.longitude}
            </span>
        </li>
    );
};

export default DeliveryBoyCard;
