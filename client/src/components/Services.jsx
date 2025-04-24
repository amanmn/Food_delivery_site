import { FaUtensils, FaTruck, FaHeadset } from "react-icons/fa";

const Services = () => {
    return (
      <section className="py-24 px-10 lg:px-24 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-xl text-red-600">WHAT WE SERVE</h2>
          <h2 className="text-5xl text-gray-800 font-bold mt-4">
            Your Favourite Food <br /> Delivery Partner
          </h2>
        </div>
  
        {/* Grid Layout (Fixed Display Issue) */}
        <div className="mt-12 grid md:grid-cols-3 md:grid-rowa-3 gap-8 max-w-6xl mx-auto">
          {/* Service 1 */}
          <div className="bg-white shadow-lg p-8 rounded-lg text-center hover:shadow-2xl transition">
            <FaUtensils className="text-red-500 text-5xl mx-auto" />
            <h3 className="text-2xl font-semibold mt-4 text-gray-800">Delicious Food</h3>
            <p className="text-gray-600 mt-3">
              We serve high-quality meals with fresh ingredients.
            </p>
          </div>
  
          {/* Service 2 */}
          <div className="bg-white shadow-lg p-8 rounded-lg text-center hover:shadow-2xl transition">
            <FaTruck className="text-red-500 text-5xl mx-auto" />
            <h3 className="text-2xl font-semibold mt-4 text-gray-800">Fastest Delivery</h3>
            <p className="text-gray-600 mt-3">
              Delivery that is always on time, even faster!
            </p>
          </div>
  
          {/* Service 3 */}
          <div className="bg-white shadow-lg p-8 rounded-lg text-center hover:shadow-2xl transition">
            <FaHeadset className="text-red-500 text-5xl mx-auto" />
            <h3 className="text-2xl font-semibold mt-4 text-gray-800">24/7 Support</h3>
            <p className="text-gray-600 mt-3">
              Not only fast, but quality is also our priority.
            </p>
          </div>
        </div>
      </section>
    );
  };
  
  export default Services;