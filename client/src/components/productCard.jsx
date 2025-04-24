import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
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
    <div className="border p-4 rounded-xl shadow-md">
      <img src={product.image} alt={product.name} className="w-full h-40 object-cover mb-4" />
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-gray-600">₹{product.price}</p>
      <button
        onClick={handleAddToCart}
        className="bg-green-500 text-white px-4 py-2 mt-3 rounded-lg hover:bg-green-600"
      >
        Add to Cart
      </button>
    </div>
  );
};
