import { useState } from 'react'
import axios from "axios"
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaUtensils } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setMyShopData } from '../../src/redux/features/owner/ownerSlice';
import { API_URL } from '../../src/config';
import { useLoadMyShopDataQuery } from '../../src/redux/features/owner/ownerApi';
import { toast } from 'react-toastify';
import { Loader2Icon } from 'lucide-react';

const AddFoodItem = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { data: myShopData, refetch } = useLoadMyShopDataQuery();

    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [frontendImage, setFrontendImage] = useState(null)
    const [backendImage, setBackendImage] = useState(null);
    const [category, setCategory] = useState("");
    const [foodType, setFoodType] = useState("veg");

    const handleImage = (e) => {
        const file = e.target.files[0];
        setBackendImage(file);
        setFrontendImage(URL.createObjectURL(file));
    }
    const categories = [
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

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name || !category || !price || !foodType || !backendImage) {
            alert("Please fill in all fields before saving");
            return;
        }
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("category", category);
            formData.append("foodType", foodType);
            formData.append("price", price);

            if (backendImage) formData.append("image", backendImage);
            const result = await axios.post(`${API_URL}/api/item/add-item`,
                formData,
                { withCredentials: true })
            await refetch();
            dispatch(setMyShopData(result.data))
            setLoading(false);
            navigate("/dash");
            // console.log(result.data);
            toast.success("Item added successfully");

        } catch (error) {
            setLoading(false);
            console.log(error);
            toast.error("Failed to add item");
        }
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
                        Add delicious foods
                    </div>

                </div>

                <form className='space-y-5' onSubmit={handleSave}>
                    <div>
                        <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='Enter Item Name'
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    </div>
                    <div>
                        <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>Food Image</label>
                        <input
                            type="file"
                            accept='image/*'
                            onChange={handleImage}
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                        {frontendImage &&
                            <div className="mt-4">
                                <img src={frontendImage} alt="" className='w-full h-48 object-cover rounded-lg border' />
                            </div>
                        }
                    </div>
                    <div>
                        <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>Price</label>
                        <input
                            type="Number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            placeholder='Enter Item Price'
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    </div>

                    <div>
                        <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>Select food-type</label>
                        <select
                            value={foodType}
                            onChange={(e) => setFoodType(e.target.value)}
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                            <option value="veg">veg</option>
                            <option value="non veg">nonveg</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>Select Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}

                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                            <option value="">select category</option>
                            {categories.map((cat, index) => (
                                <option key={index}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        className='w-full bg-blue-500 text-gray-950 px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200 cursor-pointer'
                        disabled={loading}
                    >
                        {loading ? <Loader2Icon size={20} /> : "Add Item"}

                    </button>
                </form>
            </div>
        </div>
    )
}

export default AddFoodItem
