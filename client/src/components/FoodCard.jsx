import React from 'react'
import { FaStar } from "react-icons/fa"
import { FaRegStar } from "react-icons/fa"



const FoodCard = () => {

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                (i < rating) ? (< FaStar className='text-yellow-500 text-lg' />) : (<FaRegStar className='text-yellow-500 text-lg' />)
            )
        }
        return stars;
    }

    return (
        <div className='flex flex-center gap-1 mt-1'>
            {renderStars(0)}
            <span className='text-xs text-gray-500'>
                {0}
            </span>
        </div>
    )
}

export default FoodCard
