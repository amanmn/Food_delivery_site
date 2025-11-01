import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Topbar";
import AdminDashboard from "./AdminDashboard";
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { setMyShopData } from "../../src/redux/features/owner/ownerSlice";
import { useDispatch } from "react-redux";
import { useLoadMyShopDataQuery } from "../../src/redux/features/owner/ownerApi";

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: myShopData, refetch, isLoading } = useLoadMyShopDataQuery();

  useEffect(() => {
    if (myShopData) dispatch(setMyShopData(myShopData));
    refetch();
  }, [myShopData, dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-3 text-gray-700">
          <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium">Loading your shop data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      {/* ===== Sidebar ===== */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static`}
      >
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* ===== Overlay (mobile) ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== Main Content ===== */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Navbar / Topbar */}
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* ===== No Shop Data View ===== */}
        {!myShopData && (
          <div className="flex justify-center items-center flex-1 px-4 sm:px-6 py-10">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300 text-center">
              <FaUtensils className="text-blue-500 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5" />
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                Add Your Restaurant
              </h2>
              <p className="text-gray-600 mb-6 text-base sm:text-sm">
                Join our platform and serve your food to thousands of customers every day!
              </p>
              <button
                onClick={() => navigate("/create-edit-shop")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition duration-200"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {/* ===== Admin Dashboard (when shop data exists) ===== */}
        {myShopData && (
          <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 bg-gray-50">
            <AdminDashboard />
          </main>
        )}
      </div>
    </div>
  );
}
