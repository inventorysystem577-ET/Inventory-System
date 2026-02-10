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
        ? "bg-red-500/20 text-red-400 border border-red-500/30"
        : "bg-red-100 text-red-700 border border-red-200";
    }
    if (quantity <= 5) {
      return darkMode
        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
        : "bg-orange-100 text-orange-700 border border-orange-200";
    }
    if (quantity < 10) {
      return darkMode
        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
        : "bg-yellow-100 text-yellow-700 border border-yellow-200";
    }
    return darkMode
      ? "bg-green-500/20 text-green-400 border border-green-500/30"
      : "bg-green-100 text-green-700 border border-green-200";
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
    if (quantity === 0) return "bg-red-500";
    if (quantity <= 5) return "bg-orange-500";
    if (quantity < 10) return "bg-yellow-500";
    return "bg-green-500";
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
        fillColor: [37, 99, 235], // blue header
      },
    });

    doc.save("inventory-report.pdf");
  };

  return (
    <div
      className={
        darkMode
          ? "dark min-h-screen bg-gray-900 text-white"
          : "min-h-screen bg-gray-50 text-black"
      }
    >
      {/* Top Navbar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b shadow-sm ${
          darkMode
            ? "bg-gray-800/90 border-gray-700"
            : "bg-white/90 border-gray-300"
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
                  darkMode ? "bg-gray-700" : "bg-gray-300"
                }`}
              ></div>

              {/* Center icon + title */}
              <div className="flex items-center gap-2 px-2 sm:px-3">
                <Package
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide whitespace-nowrap">
                  Inventory Stock Level
                </h1>
              </div>

              {/* Right line */}
              <div
                className={`flex-1 h-[2px] max-w-[100px] sm:max-w-[150px] md:max-w-[200px] ${
                  darkMode ? "bg-gray-700" : "bg-gray-300"
                }`}
              ></div>
            </div>

            {/* Subtitle */}
            <p className="text-center text-xs sm:text-sm opacity-70 px-4">
              Monitor real-time stock levels and inventory status
            </p>
          </div>

          {/* Export Button */}
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-4 sm:mb-6">
            <button
              onClick={exportToPDF}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm sm:text-base
${
  darkMode
    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40"
    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
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
      ? "ring-2 ring-red-500 shadow-red-500/30 shadow-lg scale-[1.03]"
      : ""
  }
  ${
    darkMode
      ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
      : "bg-white border-gray-200 hover:bg-red-50"
  }
  animate__animated animate__fadeInUp`}
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-2">
                <div className="text-center sm:text-left">
                  <p
                    className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs sm:text-sm font-medium`}
                  >
                    Out of Stock
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-red-500 mt-1 group-hover:scale-110 transition">
                    {statusCounts.out}
                  </p>
                </div>
                <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 opacity-60 group-hover:scale-125 transition" />
              </div>
            </div>

            {/* Critical */}
            <div
              onClick={() => setFilterStatus("critical")}
              className={`p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group
  ${
    filterStatus === "critical"
      ? "ring-2 ring-orange-500 shadow-orange-500/30 shadow-lg scale-[1.03]"
      : ""
  }
  ${
    darkMode
      ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
      : "bg-white border-gray-200 hover:bg-orange-50"
  }
  animate__animated animate__fadeInUp`}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-2">
                <div className="text-center sm:text-left">
                  <p
                    className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs sm:text-sm font-medium`}
                  >
                    Critical Level
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-orange-500 mt-1 group-hover:scale-110 transition">
                    {statusCounts.critical}
                  </p>
                </div>
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 opacity-60 group-hover:scale-125 transition" />
              </div>
            </div>

            {/* Low Stock */}
            <div
              onClick={() => setFilterStatus("low")}
              className={`p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group
  ${
    filterStatus === "low"
      ? "ring-2 ring-yellow-500 shadow-yellow-500/30 shadow-lg scale-[1.03]"
      : ""
  }
  ${
    darkMode
      ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
      : "bg-white border-gray-200 hover:bg-yellow-50"
  }
  animate__animated animate__fadeInUp`}
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-2">
                <div className="text-center sm:text-left">
                  <p
                    className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs sm:text-sm font-medium`}
                  >
                    Low Stock
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-500 mt-1 group-hover:scale-110 transition">
                    {statusCounts.low}
                  </p>
                </div>
                <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 opacity-60 group-hover:scale-125 transition" />
              </div>
            </div>

            {/* Available */}
            <div
              onClick={() => setFilterStatus("available")}
              className={`p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group
  ${
    filterStatus === "available"
      ? "ring-2 ring-green-500 shadow-green-500/30 shadow-lg scale-[1.03]"
      : ""
  }
  ${
    darkMode
      ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
      : "bg-white border-gray-200 hover:bg-green-50"
  }
  animate__animated animate__fadeInUp`}
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-2">
                <div className="text-center sm:text-left">
                  <p
                    className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs sm:text-sm font-medium`}
                  >
                    Available
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-green-500 mt-1 group-hover:scale-110 transition">
                    {statusCounts.available}
                  </p>
                </div>
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 opacity-60 group-hover:scale-125 transition" />
              </div>
            </div>
          </div>

          {/* Alert Banner for Critical Items */}
          {(statusCounts.out > 0 || statusCounts.critical > 0) && (
            <div
              className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border-l-4 animate__animated animate__fadeInLeft ${
                darkMode
                  ? "bg-red-500/10 border-red-500 text-red-300"
                  : "bg-red-50 border-red-400 text-red-800"
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
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Filter by Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`border rounded-lg px-3 py-2 w-full sm:w-60 focus:outline-none focus:ring-2 transition-all text-sm ${
                darkMode
                  ? "border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                  : "border-gray-300 focus:ring-blue-400 focus:border-blue-400 bg-white text-black"
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
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <table className="min-w-full w-full">
              <thead
                className={`sticky top-0 z-10 ${
                  darkMode
                    ? "bg-gray-700/50 border-b border-gray-600"
                    : "bg-gray-50 border-b border-gray-200"
                }`}
              >
                <tr>
                  {["Item Name", "Current Stock", "Status", "Date Added"].map(
                    (head) => (
                      <th
                        key={head}
                        className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap ${
                          darkMode ? "text-gray-300" : "text-gray-700"
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
                  darkMode ? "divide-gray-700" : "divide-gray-200"
                }`}
              >
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className={`px-4 sm:px-6 py-12 sm:py-16 text-center ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <Package
                        className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 animate__animated animate__bounce animate__infinite animate__slow ${
                          darkMode ? "text-gray-600" : "text-gray-300"
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
                        darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td
                        className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap font-semibold text-sm sm:text-base ${
                          darkMode ? "text-gray-200" : "text-gray-900"
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
                            ? "text-red-500"
                            : item.quantity <= 5
                              ? "text-orange-500"
                              : item.quantity < 10
                                ? "text-yellow-500"
                                : "text-green-500"
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
                          darkMode ? "text-gray-300" : "text-gray-700"
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
