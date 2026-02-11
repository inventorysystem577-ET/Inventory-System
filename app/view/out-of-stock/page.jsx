/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import TopNavbar from "../../components/TopNavbar";
import { Package, AlertTriangle, TrendingDown, XCircle } from "lucide-react";
import "animate.css";

// Import helper
import { fetchParcelItems } from "../../utils/parcelShippedHelper";

export default function Page() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("stock-inventory");
  const [darkMode, setDarkMode] = useState(false);
  const [items, setItems] = useState([]); // all items from parcel_in
  const [filterStatus, setFilterStatus] = useState(statusParam || "all"); // all, available, low, critical, out

  // Helper to get stock status
  const getStockStatus = (quantity) => {
    if (quantity === 0) return "out";
    if (quantity <= 5) return "critical";
    if (quantity < 10) return "low";
    return "available";
  };

  // Helper to get status label
  const getStatusLabel = (quantity) => {
    if (quantity === 0) return "Out of Stock";
    if (quantity <= 5) return "Critical Level";
    if (quantity < 10) return "Low Stock";
    return "Available";
  };

  // Helper to get status color
  const getStatusColor = (quantity, darkMode) => {
    if (quantity === 0) {
      return darkMode
        ? "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30"
        : "bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]";
    }
    if (quantity <= 5) {
      return darkMode
        ? "bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30"
        : "bg-[#FFEDD5] text-[#EA580C] border border-[#FED7AA]";
    }
    if (quantity < 10) {
      return darkMode
        ? "bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/30"
        : "bg-[#FEF9C3] text-[#EAB308] border border-[#FEF08A]";
    }
    return darkMode
      ? "bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30"
      : "bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]";
  };

  // Helper to get status icon
  const getStatusIcon = (quantity) => {
    if (quantity === 0)
      return <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
    if (quantity <= 5)
      return (
        <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate__animated animate__headShake animate__infinite animate__slow" />
      );
    if (quantity < 10)
      return <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
    return <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
  };

  // Helper to get indicator dot color
  const getIndicatorColor = (quantity) => {
    if (quantity === 0) return "bg-[#EF4444]";
    if (quantity <= 5) return "bg-[#F97316]";
    if (quantity < 10) return "bg-[#FACC15]";
    return "bg-[#22C55E]";
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) setDarkMode(savedDarkMode === "true");

    const loadItems = async () => {
      const parcelInItems = await fetchParcelItems();
      setItems(parcelInItems);
    };

    loadItems();
  }, []);

  // Update filter when status param changes
  useEffect(() => {
    if (statusParam) {
      setFilterStatus(statusParam);
    }
  }, [statusParam]);

  // Filter items based on selected status
  const filteredItems = items.filter((item) => {
    if (filterStatus === "all") return true;
    return getStockStatus(item.quantity) === filterStatus;
  });

  // Count items by status
  const statusCounts = {
    out: items.filter((item) => item.quantity === 0).length,
    critical: items.filter((item) => item.quantity > 0 && item.quantity <= 5)
      .length,
    low: items.filter((item) => item.quantity > 5 && item.quantity < 10).length,
    available: items.filter((item) => item.quantity >= 10).length,
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Inventory Stock Report", 14, 18);

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

    const tableColumn = ["Item Name", "Current Stock", "Status", "Date Added"];

    const tableRows = filteredItems.map((item) => [
      item.name,
      `${item.quantity} units`,
      getStatusLabel(item.quantity),
      item.date,
    ]);

    autoTable(doc, {
      startY: 35,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [30, 58, 138], // Royal Blue #1E3A8A
      },
    });

    doc.save("inventory-report.pdf");
  };

  return (
    <div
      className={
        darkMode
          ? "dark min-h-screen bg-[#0B0B0B] text-white"
          : "min-h-screen bg-[#F9FAFB] text-black"
      }
    >
      {/* Top Navbar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b shadow-sm ${
          darkMode
            ? "bg-[#111827]/90 border-[#374151]"
            : "bg-white/90 border-[#E5E7EB]"
        }`}
      >
        <TopNavbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      </div>

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
      />

      {/* Main Content */}
      <main
        className={`pt-20 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-0"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-10 animate__animated animate__fadeInDown">
            {/* Header with centered lines */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
              {/* Left line */}
              <div
                className={`flex-1 h-[2px] max-w-[100px] sm:max-w-[150px] md:max-w-[200px] ${
                  darkMode ? "bg-[#374151]" : "bg-[#D1D5DB]"
                }`}
              ></div>

              {/* Center icon + title */}
              <div className="flex items-center gap-2 px-2 sm:px-3">
                <Package
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    darkMode ? "text-[#3B82F6]" : "text-[#1E3A8A]"
                  }`}
                />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide whitespace-nowrap">
                  Inventory Stock Level
                </h1>
              </div>

              {/* Right line */}
              <div
                className={`flex-1 h-[2px] max-w-[100px] sm:max-w-[150px] md:max-w-[200px] ${
                  darkMode ? "bg-[#374151]" : "bg-[#D1D5DB]"
                }`}
              ></div>
            </div>

            {/* Subtitle */}
            <p
              className={`text-center text-xs sm:text-sm px-4 ${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}
            >
              Monitor real-time stock levels and inventory status
            </p>
          </div>

          {/* Export Button */}
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-4 sm:mb-6">
            <button
              onClick={exportToPDF}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm sm:text-base ${
                darkMode
                  ? "bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white"
                  : "bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white"
              }`}
            >
              📄 Export as PDF
            </button>
          </div>

          {/* Status Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Out of Stock */}
            <div
              onClick={() => setFilterStatus("out")}
              className={`p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group
  ${
    filterStatus === "out"
      ? "ring-2 ring-[#EF4444] shadow-[#EF4444]/30 shadow-lg scale-[1.03]"
      : ""
  }
  ${
    darkMode
      ? "bg-[#1F2937] border-[#374151] hover:bg-[#374151]"
      : "bg-white border-[#E5E7EB] hover:bg-[#FEE2E2]"
  }
  animate__animated animate__fadeInUp`}
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-2">
                <div className="text-center sm:text-left">
                  <p
                    className={`${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"} text-xs sm:text-sm font-medium`}
                  >
                    Out of Stock
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#EF4444] mt-1 group-hover:scale-110 transition">
                    {statusCounts.out}
                  </p>
                </div>
                <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-[#EF4444] opacity-60 group-hover:scale-125 transition" />
              </div>
            </div>

            {/* Critical */}
            <div
              onClick={() => setFilterStatus("critical")}
              className={`p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group
  ${
    filterStatus === "critical"
      ? "ring-2 ring-[#F97316] shadow-[#F97316]/30 shadow-lg scale-[1.03]"
      : ""
  }
  ${
    darkMode
      ? "bg-[#1F2937] border-[#374151] hover:bg-[#374151]"
      : "bg-white border-[#E5E7EB] hover:bg-[#FFEDD5]"
  }
  animate__animated animate__fadeInUp`}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-2">
                <div className="text-center sm:text-left">
                  <p
                    className={`${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"} text-xs sm:text-sm font-medium`}
                  >
                    Critical Level
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#F97316] mt-1 group-hover:scale-110 transition">
                    {statusCounts.critical}
                  </p>
                </div>
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-[#F97316] opacity-60 group-hover:scale-125 transition" />
              </div>
            </div>

            {/* Low Stock */}
            <div
              onClick={() => setFilterStatus("low")}
              className={`p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group
  ${
    filterStatus === "low"
      ? "ring-2 ring-[#FACC15] shadow-[#FACC15]/30 shadow-lg scale-[1.03]"
      : ""
  }
  ${
    darkMode
      ? "bg-[#1F2937] border-[#374151] hover:bg-[#374151]"
      : "bg-white border-[#E5E7EB] hover:bg-[#FEF9C3]"
  }
  animate__animated animate__fadeInUp`}
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-2">
                <div className="text-center sm:text-left">
                  <p
                    className={`${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"} text-xs sm:text-sm font-medium`}
                  >
                    Low Stock
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#FACC15] mt-1 group-hover:scale-110 transition">
                    {statusCounts.low}
                  </p>
                </div>
                <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-[#FACC15] opacity-60 group-hover:scale-125 transition" />
              </div>
            </div>

            {/* Available */}
            <div
              onClick={() => setFilterStatus("available")}
              className={`p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group
  ${
    filterStatus === "available"
      ? "ring-2 ring-[#22C55E] shadow-[#22C55E]/30 shadow-lg scale-[1.03]"
      : ""
  }
  ${
    darkMode
      ? "bg-[#1F2937] border-[#374151] hover:bg-[#374151]"
      : "bg-white border-[#E5E7EB] hover:bg-[#DCFCE7]"
  }
  animate__animated animate__fadeInUp`}
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-2">
                <div className="text-center sm:text-left">
                  <p
                    className={`${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"} text-xs sm:text-sm font-medium`}
                  >
                    Available
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#22C55E] mt-1 group-hover:scale-110 transition">
                    {statusCounts.available}
                  </p>
                </div>
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-[#22C55E] opacity-60 group-hover:scale-125 transition" />
              </div>
            </div>
          </div>

          {/* Alert Banner for Critical Items */}
          {(statusCounts.out > 0 || statusCounts.critical > 0) && (
            <div
              className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border-l-4 animate__animated animate__fadeInLeft ${
                darkMode
                  ? "bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444]"
                  : "bg-[#FEE2E2] border-[#DC2626] text-[#DC2626]"
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 animate__animated animate__swing animate__infinite animate__slow" />
                <div>
                  <p className="font-semibold text-sm sm:text-base">
                    Inventory Alert
                  </p>
                  <p className="text-xs sm:text-sm opacity-90 mt-0.5">
                    {statusCounts.out > 0 &&
                      `${statusCounts.out} item${statusCounts.out > 1 ? "s" : ""} out of stock`}
                    {statusCounts.out > 0 && statusCounts.critical > 0 && " • "}
                    {statusCounts.critical > 0 &&
                      `${statusCounts.critical} item${statusCounts.critical > 1 ? "s" : ""} at critical level`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filter Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
            <label
              className={`text-xs sm:text-sm font-medium ${
                darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
              }`}
            >
              Filter by Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`border rounded-lg px-3 py-2 w-full sm:w-60 focus:outline-none focus:ring-2 transition-all text-sm ${
                darkMode
                  ? "border-[#374151] focus:ring-[#3B82F6] focus:border-[#3B82F6] bg-[#111827] text-white"
                  : "border-[#D1D5DB] focus:ring-[#1E3A8A] focus:border-[#1E3A8A] bg-white text-black"
              }`}
            >
              <option value="all">All Items ({items.length})</option>
              <option value="available">
                Available ({statusCounts.available})
              </option>
              <option value="low">Low Stock ({statusCounts.low})</option>
              <option value="critical">
                Critical Level ({statusCounts.critical})
              </option>
              <option value="out">Out of Stock ({statusCounts.out})</option>
            </select>
          </div>

          {/* Items Table */}
          <div
            className={`rounded-xl shadow-lg overflow-x-auto overflow-y-auto border animate__animated animate__fadeInUp max-h-[600px] ${
              darkMode
                ? "bg-[#1F2937] border-[#374151]"
                : "bg-white border-[#E5E7EB]"
            }`}
          >
            <table className="min-w-full w-full">
              <thead
                className={`sticky top-0 z-10 ${
                  darkMode
                    ? "bg-[#111827] border-b border-[#374151]"
                    : "bg-[#F9FAFB] border-b border-[#E5E7EB]"
                }`}
              >
                <tr>
                  {["Item Name", "Current Stock", "Status", "Date Added"].map(
                    (head) => (
                      <th
                        key={head}
                        className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap ${
                          darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                        }`}
                      >
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  darkMode ? "divide-[#374151]" : "divide-[#E5E7EB]"
                }`}
              >
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className={`px-4 sm:px-6 py-12 sm:py-16 text-center ${
                        darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
                      }`}
                    >
                      <Package
                        className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 animate__animated animate__bounce animate__infinite animate__slow ${
                          darkMode ? "text-[#6B7280]" : "text-[#D1D5DB]"
                        }`}
                      />
                      <p className="text-base sm:text-lg font-medium mb-1">
                        No items found
                      </p>
                      <p className="text-xs sm:text-sm opacity-75">
                        Try changing the filter or add new items
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`transition-all duration-200 animate__animated animate__fadeInUp ${
                        darkMode
                          ? "hover:bg-[#374151]/40"
                          : "hover:bg-[#F3F4F6]"
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td
                        className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap font-semibold text-sm sm:text-base ${
                          darkMode ? "text-[#FFFFFF]" : "text-[#111827]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full animate__animated animate__pulse animate__infinite ${getIndicatorColor(
                              item.quantity,
                            )}`}
                          />
                          {item.name}
                        </div>
                      </td>
                      <td
                        className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base font-semibold ${
                          item.quantity === 0
                            ? "text-[#EF4444]"
                            : item.quantity <= 5
                              ? "text-[#F97316]"
                              : item.quantity < 10
                                ? "text-[#FACC15]"
                                : "text-[#22C55E]"
                        }`}
                      >
                        {item.quantity} units
                      </td>
                      <td
                        className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap`}
                      >
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold ${getStatusColor(
                            item.quantity,
                            darkMode,
                          )}`}
                        >
                          {getStatusIcon(item.quantity)}
                          {getStatusLabel(item.quantity)}
                        </span>
                      </td>
                      <td
                        className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base ${
                          darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                        }`}
                      >
                        {item.date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
