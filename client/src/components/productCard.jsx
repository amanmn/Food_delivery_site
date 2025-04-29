import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import { useGetProductDataQuery } from "../redux/features/product/productApi";

const ProductCard = () => {
  // const [products, setProducts] = useState([]);
  const dispatch = useDispatch();
  const {data: products } = useGetProductDataQuery();

  useEffect(() => {
        console.log(products);
  }, [products]);

  const handleAddToCart = (product) => {
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      })
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
      {products.map((product) => (
        <div key={product._id} className="border p-4 rounded-xl shadow-md">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-40 object-cover mb-4"
          />
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-gray-600">₹{product.price}</p>
          <button
            onClick={() => handleAddToCart(product)}
            className="bg-green-500 text-white px-4 py-2 mt-3 rounded-lg hover:bg-green-600"
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductCard;
