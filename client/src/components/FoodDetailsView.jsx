import { useParams } from "react-router-dom";
import { useGetSingleProductQuery } from "../redux/features/product/itemApi";

const FoodDetailsView = () => {
    const { id } = useParams();
    console.log("Fetching details for product ID:", id);
    const { data, isLoading } = useGetSingleProductQuery(id);

    if (isLoading) return <p>Loading...</p>;

    const product = data?.product;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row gap-8">

                {/* LEFT: IMAGE */}
                <div className="flex-1 flex justify-center items-center">
                    <img
                        src={product?.image}
                        alt={product?.name}
                        className="w-full max-w-md rounded-lg object-cover"
                    />
                </div>

                {/* RIGHT: DETAILS */}
                <div className="flex-1 space-y-4">
                    <h2 className="text-3xl font-bold text-gray-800">
                        {product?.name}
                    </h2>

                    <p className="text-2xl text-red-500 font-semibold">
                        ₹{product?.price}
                    </p>

                    <p className="text-gray-600">
                        {product?.description}
                    </p>

                    <button className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition">
                        Add to Cart
                    </button>
                </div>

            </div>
        </div>
    );
};

export default FoodDetailsView;