import { FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";
import Logo from "../utils/logo.png";

const Footer = () => {
  return (
    <footer className="bg-white text-gray-700 py-10 px-6 sm:px-12 lg:px-32">
      <div className="w-full flex justify-center">
        <div className="max-w-7xl w-full px-6">
          <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-y-10 gap-x-16 text-center lg:text-left mb-20">
            {/* Left Section */}
            <div className="flex flex-col md:items-start lg:items-start text-center sm:text-center lg:text-left">
              {/* Logo & Brand */}
              <div className="flex justify-center space-x-3">
                <img src={Logo} alt="Fudo Logo" className="w-12 h-12 object-contain" />
                <span className="text-gray-700 text-2xl font-bold tracking-wide">Fudo</span>
              </div>

              {/* Description */}
              <p className="mt-6 text-gray-600 md:text-start py-2 text-lg leading-relaxed max-w-md">
                Our job is to fill your tummy with delicious food and fast delivery time.
              </p>

              {/* Social Icons */}
              <div className="flex space-x-6 mt-6 justify-center sm:justify-center lg:justify-start">
                <a href="#" className="text-red-500 text-2xl hover:opacity-75">
                  <FaInstagram />
                </a>
                <a href="#" className="text-red-500 text-2xl hover:opacity-75">
                  <FaFacebookF />
                </a>
                <a href="#" className="text-red-500 text-2xl hover:opacity-75">
                  <FaTwitter />
                </a>
              </div>
            </div>

            {/* About Section */}
            <div className="flex flex-col items-center sm:items-center lg:items-start">
              <h3 className="text-2xl text-gray-700 font-semibold">About</h3>
              <ul className="mt-4 text-lg space-y-4 text-gray-600 text-base">
                <li><a href="#" className="hover:text-red-500">About Us</a></li>
                <li><a href="#" className="hover:text-red-500">Features</a></li>
                <li><a href="#" className="hover:text-red-500">News</a></li>
                <li><a href="#" className="hover:text-red-500">Menu</a></li>
              </ul>
            </div>

            {/* Company Section */}
            <div className="flex flex-col items-center sm:items-center lg:items-start">
              <h3 className="text-2xl text-gray-700 font-semibold">Company</h3>
              <ul className="mt-4 text-lg space-y-4 text-gray-600 text-base">
                <li><a href="#" className="hover:text-red-500">Why Fudo?</a></li>
                <li><a href="#" className="hover:text-red-500">Partner With Us</a></li>
                <li><a href="#" className="hover:text-red-500">FAQ</a></li>
                <li><a href="#" className="hover:text-red-500">Blog</a></li>
              </ul>
            </div>

            {/* Support Section */}
            <div className="flex flex-col items-center sm:items-center lg:items-start">
              <h3 className="text-2xl text-gray-700 font-semibold">Support</h3>
              <ul className="mt-4 text-lg space-y-4 text-gray-600 text-base">
                <li><a href="#" className="hover:text-red-500">Account</a></li>
                <li><a href="#" className="hover:text-red-500">Support Center</a></li>
                <li><a href="#" className="hover:text-red-500">Feedback</a></li>
                <li><a href="#" className="hover:text-red-500">Contact Us</a></li>
                <li><a href="#" className="hover:text-red-500">Accessibility</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright Section */}
          <div className="text-center text-gray-500 text-lg mt-12">
            &copy; 2024 Web Design Mastery. All rights reserved.
          </div>
        </div>
      </div>
    </footer>

  );
};

export default Footer;
