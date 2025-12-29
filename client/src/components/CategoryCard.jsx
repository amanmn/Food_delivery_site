import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";
import categories from "../category";
import { useSelector } from "react-redux";
import { MdLocationCity } from "react-icons/md";
import { useEffect } from "react";
import { useGetShopByCityQuery } from "../redux/features/shop/shopApi";

const CategoryCard = () => {
  const { city } = useSelector(state => state.user);
  const { data: shopsInMyCity = [] } = useGetShopByCityQuery(city, {
    skip: !city,
  });

  return (
    <div>
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 ">
        {/* Heading Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            🍴 Browse by Category
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Discover your favorite dishes across various cuisines
          </p>
        </div>

        {/* Swiper Section */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={25}
          slidesPerView={4}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 2500 }}
          loop
          breakpoints={{
            320: { slidesPerView: 1 },
            480: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
        >
          {categories.map((item) => (
            <SwiperSlide key={item._id}>
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 cursor-pointer transform  mb-15">
                <div className="relative overflow-hidden rounded-xl mb-3">
                  <img
                    src={item.image}
                    alt={item.category}
                    className="w-full h-44 sm:h-48 object-cover rounded-xl transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {item.category}
                </h3>
                <p className="text-gray-500 text-sm mt-1 truncate">
                  Explore delicious {item.category.toLowerCase()} dishes
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>


      <section className="py-2 px-4 sm:px-6 lg:px-8 bg-gray-50 ">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            <MdLocationCity className="inline-flex mb-1 mr-2" size={25} />
            Shops In {city ? `${city} City` : "Some Cities"}
          </h2>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={25}
            slidesPerView={4}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 2500 }}
            loop
            breakpoints={{
              320: { slidesPerView: 1 },
              480: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
          >
            {shopsInMyCity?.map((item) => (
              <SwiperSlide key={item._id}>
                <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 cursor-pointer transform mb-8">
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <img
                      src={item.image}
                      alt={item.category}
                      className="w-full h-56 sm:h-72 object-cover rounded-xl transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 truncate">
                    Explore delicious {item.name.toLowerCase()} dishes
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

        </div>
      </section>
    </div>
  );
};

export default CategoryCard;
