import React from 'react'
import { useGetItemsByShopQuery } from '../redux/features/product/itemApi'
import { useEffect } from 'react'

const ShopItems = () => {
    const {data:items, isLoading, error} = useGetItemsByShopQuery();
    
    useEffect(() => {
        console.log("ShopItems component mounted,", items);
    }, [items]);
    return (
        <div>

        </div>
    )
}

export default ShopItems
