import React, { useEffect } from 'react'
import axios from "axios"
import { API_URL } from '../config'
import { useDispatch } from "react-redux"
import { setMyShopData } from '../redux/features/owner/ownerSlice'

const useGetMyShop = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchShop = async () => {
            try {
                const result = await axios.get(`${API_URL}/api/shop/get-myshop`,
                    { withCredentials: true })
                dispatch(setMyShopData(result.data));

            } catch (error) {

            }
        }
        fetchShop();
    }, [])

    return (
        <div>

        </div>
    )
}

export default useGetMyShop
