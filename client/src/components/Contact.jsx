import React from "react";
import AppMockup from "../utils/download.png"; // Replace with actual image path

const Contact = () => {
  return (
    <section className="bg-pink-50 w-full py-16 px-6 sm:px-12 lg:px-20">
      <div className="md:flex md:flex-col-reverse md:flex-row items-center max-w-screen-2xl mx-auto bg-pink-50 justify-center px-20 md:px-20">
        {/* Left Section */}
        <div className="sm:text-center lg:text-left lg:w-1/2 flex flex-col sm:items-center lg:items-start">
          <p className="text-red-500 font-semibold uppercase tracking-wide tracking-[2px]">
            Download App
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 pb-3 mt-3 tracking-[1px] leading-snug">
            Get Started With Fudo Today!
          </h2>
          <p className="text-lg text-gray-700 mt-5 sm:text-center py-2 tracking-[2px] lg:text-left">
            Discover food wherever and whenever you want and get your food
            delivered on time, every time.
          </p>
          <button className="mt-6 bg-red-500 text-white text-lg font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-red-600 transition duration-300">
            Get The App
          </button>
        </div>

        {/* Right Section - Image */}
        <div className="w-full flex justify-center lg:w-1/2 py-10">
          <img
            src={AppMockup}
            alt="Fudo App Mockup"
            className="w-full max-w-sm sm:max-w-lg lg:max-w-2xl"
          />
        </div>

      </div>
    </section>
  );
};

export default Contact;
