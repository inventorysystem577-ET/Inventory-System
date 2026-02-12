"use client";
import {
  BarChart3,
  Package,
  PackageOpen,
  Activity,
  Users,
  LogOut,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { handleLogout } from "../controller/logoutController";

export default function Sidebar({
  sidebarOpen,
  activeTab,
  setActiveTab,
  setSidebarOpen,
  darkMode,
}) {
  const router = useRouter();

  const menuItems = [
    {
      id: "Dashboard",
      label: "Dashboard",
      icon: BarChart3,
      path: "/view/dashboard",
    },
    {
      id: "Product In",
      label: "Product In",
      icon: ArrowDownToLine,
      path: "/view/product-in",
    },
    {
      id: "Product Out",
      label: "Product Out",
      icon: ArrowUpFromLine,
      path: "/view/product-out",
    },
    {
      id: "Parcel Shipped",
      label: "Stock In",
      icon: Package,
      path: "/view/parcel-shipped",
    },
    {
      id: "Parcel Delivery",
      label: "Stock Out",
      icon: PackageOpen,
      path: "/view/parcel-delivery",
    },
    {
      id: "Inventory Stock",
      label: "Inventory",
      icon: Activity,
      path: "/view/out-of-stock",
    },
  ];

  const handleMenuClick = (id, path) => {
    setActiveTab(id);

    // Navigate to the page
    router.push(path);

    // Close sidebar on mobile after clicking
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
    } catch (err) {
      alert(err.message || "Logout failed");
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-14 sm:top-16 h-full border-r transition-all duration-300 z-20 overflow-hidden ${
          sidebarOpen ? "w-64 sm:w-72 lg:w-64" : "w-0"
        } ${
          darkMode
            ? "bg-[#111827] border-[#374151]"
            : "bg-[#F3F4F6] border-[#E5E7EB]"
        }`}
      >
        {sidebarOpen && (
          <nav className="p-4 sm:p-5 lg:p-4 space-y-2 h-full overflow-y-auto pb-20">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id, item.path)}
                className={`w-full flex items-center space-x-3 sm:space-x-4 lg:space-x-3 px-4 sm:px-5 lg:px-4 py-3 sm:py-3.5 lg:py-3 rounded-lg transition-all text-base sm:text-lg lg:text-base ${
                  activeTab === item.id
                    ? "bg-[#1E3A8A] text-white shadow-lg shadow-blue-500/30"
                    : darkMode
                      ? "text-[#D1D5DB] hover:bg-[#1F2937]"
                      : "text-[#374151] hover:bg-white"
                }`}
              >
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 flex-shrink-0" />
                <span className="font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            ))}

            <div
              className={`pt-4 mt-4 border-t ${
                darkMode ? "border-[#374151]" : "border-[#D1D5DB]"
              }`}
            >
              <button
                onClick={handleLogoutClick}
                className={`w-full flex items-center space-x-3 sm:space-x-4 lg:space-x-3 px-4 sm:px-5 lg:px-4 py-3 sm:py-3.5 lg:py-3 rounded-lg transition-all text-base sm:text-lg lg:text-base cursor-pointer ${
                  darkMode
                    ? "text-[#EF4444] hover:bg-[#1F2937]"
                    : "text-[#DC2626] hover:bg-white"
                }`}
              >
                <LogOut className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 flex-shrink-0" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </nav>
        )}
      </aside>
    </>
  );
}
