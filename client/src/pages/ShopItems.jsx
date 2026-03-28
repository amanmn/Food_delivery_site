import { useParams } from 'react-router-dom';
import { useGetItemsByShopQuery } from '../redux/features/product/itemApi'
import { useEffect } from 'react'
import Menu from '../components/Menu';
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

const ShopItems = () => {
    const navigate = useNavigate();
    const { shopId } = useParams();
    const { data: items, isLoading, error } = useGetItemsByShopQuery(shopId,
        { skip: !shopId }
    );

    useEffect(() => {
        console.log("shop:", shopId);
        console.log("items:", items);
        console.log("isLoading:", isLoading);
        console.log("error:", error);
    }, [shopId, items, isLoading, error]);

    if (isLoading) return <p>Loading shop items...</p>;
    if (error) return <p>Failed to load shop items</p>;

    return (
        <div>
            <button className='absolute top-[20px] left-[20px] z-[10px] mb-[10px] cursor-pointer'
                onClick={() => navigate("/")}
            >
                <IoIosArrowRoundBack className='text-blue-500' size={50} />
            </button>
            <Menu items={items.items} mode="shop" loading={isLoading} />
        </div>
    )
}

export default ShopItems
