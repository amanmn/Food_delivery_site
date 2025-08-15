import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Topbar";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
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

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AdminDashboard />
        </main>
      </div>
    </div>
  );
}
