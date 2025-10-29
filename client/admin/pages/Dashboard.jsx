import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Topbar";
import AdminDashboard from "./AdminDashboard";
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useLoadMyShopDataQuery } from "../../src/redux/features/owner/ownerApi";

export default function Dashboard() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: myShopData, isLoading } = useLoadMyShopDataQuery();

  // useEffect(() => {
  //   console.log(myShopData);
  // })

  if (isLoading) {
    return <p className="text-center mt-10">Loading your shop data...</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-80 transform transition-transform duration-300 lg:translate-x-0 md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:static lg:inset-auto md:static md:inset-auto `}
      >
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-opacity-30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Topbar */}
      <div className="flex flex-col flex-1">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {!myShopData &&
          <div className="flex justify-center items-center p-4 sm:p-6">
            <div className="w-full bg-gray-100 shadow-lg rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col items-center text-center">
                <FaUtensils className="text-blue-500 w-16 h-16 sm:w-20 sm:h-20 mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-950 mb-2">Add Your Restaurent</h2>
                <p className="text-gray-950 mb-4 text-xl sm:text-base">Join our food platform and reach thousands of hungry customers every day.</p>
                <button className="w-full bg-blue-500 rounded-sm p-4 sm:p-4 text-lg text-gray-950 cursor-pointer " onClick={() => navigate("/create-edit-shop")}
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        }

        {myShopData && (
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <AdminDashboard shopData={myShopData} />
          </main>
        )}
      </div>
    </div>
  );
}
