import { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaUtensils } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { setMyShopData } from '../../src/redux/features/owner/ownerSlice';
import API from '../../src/api';

const EditItem = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // const shopData = useSelector(state=>state.owner.myShopData)

    const [currentItem, setCurrentItem] = useState(null);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [foodType, setFoodType] = useState("");
    const [category, setCategory] = useState("");
    const [backendImage, setBackendImage] = useState(null);
    const [frontendImage, setFrontendImage] = useState(null)

    const categories = [
        "Snacks", "Main Course", "Desserts",
        "Pizza", "Burgers", "Sandwiches",
        "South Indian", "North Indian", "Chinese",
        "Fast Food", "Others",
    ];

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
            setBackendImage(file);
            setFrontendImage(URL.createObjectURL(file));
    };

    useEffect(() => {
        const handleGetItemById = async () => {
            try {
                const res = await API.get(`/item/get-item/${itemId}`);
                setCurrentItem(res.data);
            } catch (error) {
                console.log(error);
                toast.error("Failed to load item");
            }
        };
        handleGetItemById();
    }, [itemId]);

    useEffect(() => {
        if (!currentItem) return;

        setName(currentItem?.name || "");
        setPrice(currentItem?.price || "");
        setCategory(currentItem?.category || "");
        setFoodType(currentItem?.foodType || "");
        setFrontendImage(currentItem?.image || null);
        console.log(currentItem?.image);
    }, [currentItem])

    useEffect(() => {
        return () => {
            if (frontendImage?.startsWith("blob:")) {
                URL.revokeObjectURL(frontendImage);
            }
        };
    }, [frontendImage]);

    const handleSave = async (e) => {
        e.preventDefault();

        if (!name || !category || !price || !foodType) {
            toast.warning("Please fill in all required fields");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("category", category);
            formData.append("foodType", foodType);
            formData.append("price", price);
            if (backendImage) formData.append("image", backendImage);

            const res = await API.put(`/item/edit-item/${itemId}`, formData);

            dispatch(setMyShopData(res.data))
            console.log(res.data);
            toast.success("Item updated successfully");
            navigate("/dash");
        } catch (error) {
            console.log(error);
            toast.error("Failed to update item");
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
                        Edit Product
                    </div>
                </div>

                <form className='space-y-5' onSubmit={handleSave}>
                    <div>
                        <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='Item Name'
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
                                <img
                                    src={frontendImage}
                                    alt="food-item"
                                    className='w-full h-48 object-cover rounded-lg border' />
                            </div>
                        }
                    </div>
                    <div>
                        <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>Price</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            placeholder='Price'
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
                            <option value="veg">Veg</option>
                            <option value="non veg">Non-Veg</option>
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
                            {categories.map((cat) => (
                                <option key={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <button className='w-full bg-blue-500 text-gray-950 px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200 cursor-pointer'>
                        Update Item
                    </button>
                </form>
            </div>
        </div>
    )
}

export default EditItem;
