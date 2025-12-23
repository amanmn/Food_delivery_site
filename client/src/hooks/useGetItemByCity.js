import React, { useEffect } from 'react'
import axios from "axios"
// import { API_URL } from '../config'
import { useDispatch, useSelector } from "react-redux"
import { setItemsInMyCity } from '../redux/features/user/userSlice'

const useGetItemByCity = () => {
    const dispatch = useDispatch();
    const { city } = useSelector(state => state.user);

    useEffect(() => {
        if (!city) return;

        const fetchItem = async () => {
            try {
                const result = await axios.get(`/api/item/get-item-by-city/${city}`,
                    { withCredentials: true });
                dispatch(setItemsInMyCity(result.data));
                console.log(result.data)
            } catch (error) {
                console.log(error);
            }
        }
        if (city) fetchItem();
    }, [city, dispatch])

}

export default useGetItemByCity
