import { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaUtensils } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify"

import useDetectLocation from "../../src/hooks/useDetectLocation";
import { setMyShopData } from '../../src/redux/features/owner/ownerSlice';
import { updateUserProfile } from '../../src/redux/features/user/userSlice';
import { useGetMyShopQuery, useCreateOrEditShopMutation } from '../../src/redux/features/shop/shopApi';

const CreateEditShop = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const detectLocation = useDetectLocation();

    const { data: myShopData } = useGetMyShopQuery();
    const [createOrEditShop, { isLoading }] = useCreateOrEditShopMutation();

    const [name, setName] = useState(myShopData?.name || "");
    const [address, setAddress] = useState(myShopData?.address || "");
    const [cityName, setCityName] = useState(myShopData?.city || "");
    const [stateName, setStateName] = useState(myShopData?.state || "");
    const [frontendImage, setFrontendImage] = useState(myShopData?.image || null)
    const [backendImage, setBackendImage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        detectLocation();
    }, [])

    useEffect(() => {
        if (!myShopData) return;
        setName(myShopData.name || "");
        setAddress(myShopData.address || "");
        setCityName(myShopData.city || "");
        setStateName(myShopData.state || "");
        setFrontendImage(myShopData?.image || null);

        dispatch(setMyShopData(myShopData));
    }, [myShopData, dispatch]);

    // Prefill from detected location
    useEffect(() => {
        if (city) setCityName(city);
        if (state) setStateName(state);
        if (address) setAddress(address);
    }, [city, state, address]);

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setBackendImage(file);
        setFrontendImage(URL.createObjectURL(file));
    }

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name || !address || !cityName || !stateName) {
            toast.warning("All fields are required");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("name", name);
            formData.append("city", cityName);
            formData.append("state", stateName);
            formData.append("address", address);
            if (backendImage) formData.append("image", backendImage);

            const res = await createOrEditShop(formData).unwrap();
            console.log(res.data);
            dispatch(setMyShopData(res.data));
            toast.success("Shop saved successfully");
            navigate("/dash");
        } catch (error) {
            console.log(error);
            toast.error("Failed to save shop");
        } finally {
            setLoading(false);
        }
        const shopData = { name, address, city: cityName, state: stateName };
        dispatch(updateUserProfile(shopData));
        console.log("Shop Saved:", shopData);
    };

    return (
        <div className='flex justify-center flex-col items-center p-6  bg-gradient-to-br from-blue-50 relative to-white min-h-screen'>
            <div className='absolute top-[20px] left-[20px] z-[10px] mb-[10px] cursor-pointer'
                onClick={() => navigate("/dash")}
            >
                <IoIosArrowRoundBack className='text-blue-500' size={50} />
            </div>

            <div className='max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-blue-100'>
                <div className='flex flex-col items-center mb-6'>
                    <div className='bg-blue-50 p-4 rounded-full mb-4'>
                        <FaUtensils className='w-16 h-16 text-blue-500' size={25} />
                    </div>
                    <div className='text-3xl font-extrabold text-gray-900'>
                        {myShopData ? "Edit Shop" : "Create Shop"}
                    </div>

                </div>

                {!city && (
                    <p className="text-sm text-gray-500 mb-2">
                        Detecting your location... Please allow access.
                    </p>
                )}

                <form className='space-y-5' onSubmit={handleSave}>
                    <div>
                        <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='Enter Shop Name'
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    </div>
                    <div>
                        <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>Shop Image</label>
                        <input
                            type="file"
                            accept='image/*'
                            onChange={handleImage}
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                        {frontendImage &&
                            <div className="mt-4">
                                <img src={frontendImage} alt="shop" className='w-full h-48 object-cover rounded-lg border' />
                            </div>
                        }

                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>City</label>
                            <input
                                type="text"
                                value={cityName}
                                onChange={(e) => setCityName(e.target.value)}
                                placeholder='Enter City'
                                className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                        <div>
                            <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>State</label>
                            <input
                                type="text"
                                value={stateName}
                                onChange={(e) => setStateName(e.target.value)}
                                placeholder='Enter State'
                                className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>Address</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder='Enter Shop Address'
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    </div>
                    <button
                        disabled={isLoading}
                        className='w-full bg-blue-500 text-gray-950 px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200 cursor-pointer'
                    >
                        {isLoading ? <Loader2Icon size={20} /> : "Save Shop"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CreateEditShop
