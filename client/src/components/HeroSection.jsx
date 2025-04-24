import Button from "./Button";
import HeaderTag from "./HeaderTag";
import heroImage from "../utils/header.png";

const HeroSection = () => {
  return (
    <section className="bg-pink-50 w-full">
     <div className="md:flex md:flex-col-reverse md:flex-row items-center max-w-screen-2xl mx-auto bg-pink-50  justify-center px-20 md:px-20 py-16 md:py-12 ">
     
      {/* Left Content */}
      <div className="w-full md:max-w-lg text-left md:text-left mt-15 md:mt-15 ml-4 md:ml-10 lg:ml-16 ">
        
        {/* Tagline */}
        <HeaderTag text="More than Faster" icon="🚴‍♂️" />

        {/* Main Heading */}
        <h1 className=" text-6xl md:text-8xl lg:text-7xl font-bold text-gray-800 tracking-wide leading-tight mt-8">
          Be The Fastest In Delivering Your <span className="text-red-500">Food</span>
        </h1>

        {/* Description */}
        <p className="text-gray-600 mt-4 text-lg text-start md:text-left">
          Our job is to fill your tummy with delicious food and fast delivery.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap sm:flex-row md:justify-start space-y-4 sm:space-y-0 sm:space-x-10  mt-6">
          <Button text="Get Started" />
          <button className="flex items-center space-x-2 cursor-pointer text-gray-700 font-medium hover:text-red-500 transition">
            <span className="text-xl bg-white p-2 rounded-full shadow-md">▶</span>
            <span>Watch Video</span>
          </button>
        </div>
      </div>

      {/* Right Image */}
      <div className="w-full flex justify-center  relative">
        <img src={heroImage} alt="Hero" className="w-[550px] sm:w-[500px] md:w-[500px]" />
      </div>
      </div>

    </section>
  );
};

export default HeroSection;
