import React, { useEffect } from 'react'
import axios from "axios"
import { API_URL } from '../config'
import { useDispatch, useSelector } from "react-redux"
import { setShopsInMyCity } from '../redux/features/user/userSlice'

const useGetShopByCity = () => {
    const dispatch = useDispatch()
    const { city } = useSelector(state => state.user);

    useEffect(() => {
        if (!city) return;
        const fetchShop = async () => {
            try {
                const result = await axios.get(`${API_URL}/api/shop/get-shop-by-city/${city}`,
                    { withCredentials: true });
                dispatch(setShopsInMyCity(result.data));
                console.log("Fetched shops for city:", result.data.city);
            } catch (error) {
                console.log(error);
            }
        }
        fetchShop();
    }, [city, dispatch])

}

export default useGetShopByCity
