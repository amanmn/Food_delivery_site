import { useParams } from 'react-router-dom';
import { useGetItemsByShopQuery } from '../redux/features/product/itemApi'
import { useEffect } from 'react'

const ShopItems = () => {
    const { shopId } = useParams();
    const { data: items, isLoading, error } = useGetItemsByShopQuery(shopId,
        { skip: !shopId }
    );

    useEffect(() => {
        console.log("shopId:", shopId);
        console.log("items:", items);
        console.log("isLoading:", isLoading);
        console.log("error:", error);
    }, [shopId, items, isLoading, error]);


    return (
        <div>

        </div>
    )
}

export default ShopItems
