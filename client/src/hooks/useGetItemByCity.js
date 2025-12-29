import React, { useEffect } from 'react'
import { useDispatch } from "react-redux"
import { useGetItemByCityQuery } from '../redux/features/product/itemApi'
import { setItemsInMyCity } from '../redux/features/user/userSlice'

const useGetItemByCity = () => {
    const dispatch = useDispatch();
    const { data, isSuccess } = useGetItemByCityQuery(city, {
        skip: !city, // Skip query if city is not set
    });

    useEffect(() => {
        if (isSuccess && data) {
            dispatch(setItemsInMyCity(data));
        }
    }, [isSuccess, data, dispatch]);
}

export default useGetItemByCity
