"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../../components/AuthGuard";
import Sidebar from "../../components/Sidebar";
import TopNavbar from "../../components/TopNavbar";
import {
  ShieldCheck,
  Settings,
  ArrowRight,
  PencilLine,
} from "lucide-react";
import { useAuth } from "../../hook/useAuth";
import { isAdminRole } from "../../utils/roleHelper";

export default function AdminPanelPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { role, loading } = useAuth();
  const router = useRouter();

  const isAdmin = isAdminRole(role);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === "true");
    }
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/view/dashboard");
    }
  }, [loading, isAdmin, router]);

  if (!isAdmin) {
    return (
      <AuthGuard darkMode={darkMode}>
        <div
          className={`min-h-screen flex items-center justify-center ${
            darkMode ? "bg-[#111827] text-white" : "bg-[#F3F4F6] text-black"
          }`}
        >
          <p className="text-sm">Redirecting...</p>
        </div>
      </AuthGuard>
    );
  }

  const adminActions = [
    {
      title: "System Inventory Status",
      description: "Manage inventory records and export/delete controls.",
      path: "/view/out-of-stock",
    },
    {
      title: "Product Management",
      description: "Create, edit, and monitor product records.",
      path: "/view/product-in",
    },
    {
      title: "Product Out Monitoring",
      description: "Review monthly product out transactions and receipts.",
      path: "/view/product-out",
    },
    {
      title: "Components Stock In",
      description: "Monitor and manage component stock arrivals.",
      path: "/view/parcel-shipped",
    },
    {
      title: "Components Stock Out",
      description: "Track component deliveries and outgoing stock.",
      path: "/view/parcel-delivery",
    },
  ];

  const cardClass = (extra = "") =>
    `rounded-xl border p-6 ${extra} ${
      darkMode
        ? "bg-[#1F2937] border-[#374151]"
        : "bg-white border-[#E5E7EB]"
    }`;

  const subtextClass = darkMode ? "text-gray-400" : "text-gray-600";

  return (
    <AuthGuard darkMode={darkMode}>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          darkMode ? "bg-[#111827] text-white" : "bg-[#F3F4F6] text-black"
        }`}
      >
        <TopNavbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
        />

        <div
          className={`transition-all duration-300 ${
            sidebarOpen ? "lg:ml-64" : "ml-0"
          } pt-16`}
        >
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className={cardClass("mb-6")}>
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-6 h-6 text-[#2563EB]" />
                <h1 className="text-2xl font-bold">Admin Control Panel</h1>
              </div>
              <p className={`text-sm ${subtextClass}`}>
                Full system control — administer all inventory operations.
              </p>
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {adminActions.map((action) => (
                <button
                  key={action.title}
                  type="button"
                  onClick={() => router.push(action.path)}
                  className={`text-left rounded-xl border p-5 transition-all hover:scale-[1.01] ${
                    darkMode
                      ? "bg-[#1F2937] border-[#374151] hover:bg-[#374151]"
                      : "bg-white border-[#E5E7EB] hover:bg-[#F9FAFB]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Settings className="w-5 h-5 text-[#2563EB]" />
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <h2 className="font-semibold mb-1">{action.title}</h2>
                  <p className={`text-xs ${subtextClass}`}>
                    {action.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Access Summary */}
            <div className={cardClass()}>
              <div className="flex items-center gap-2 mb-2">
                <PencilLine className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-semibold">
                  Admin vs Staff Access Summary
                </h3>
              </div>
              <div className={`text-sm space-y-2 ${subtextClass}`}>
                <p>
                  <strong className={darkMode ? "text-white" : "text-black"}>Admin</strong> — Full access: add, edit, delete content. Export data and control all system settings.
                </p>
                <p>
                  <strong className={darkMode ? "text-white" : "text-black"}>Staff</strong> — Can add/input new items only. Cannot delete, modify, or export records. Cannot access the admin panel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
