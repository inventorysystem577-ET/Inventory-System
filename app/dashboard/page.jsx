/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../hook/useAuth";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import {
  PackageCheck,
  PackageOpen,
  Package,
  Clock,
  AlertTriangle,
  XCircle,
  TrendingDown,
} from "lucide-react";

import "animate.css";

import { getParcelInItems } from "../controller/parcelShipped"; // parcel_in
import { getParcelOutItems } from "../controller/parcelDelivery"; // parcel_out

export default function page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [darkMode, setDarkMode] = useState(false);

  const [parcelShipped, setParcelShipped] = useState([]);
  const [parcelDelivery, setParcelDelivery] = useState([]);
  const [stockItems, setStockItems] = useState([]); // Items from parcel_in
  const [parcelShippedCount, setParcelShippedCount] = useState(0);
  const [parcelDeliveryCount, setParcelDeliveryCount] = useState(0);

  // Stock status counts
  const [statusCounts, setStatusCounts] = useState({
    out: 0,
    critical: 0,
    low: 0,
    available: 0,
  });

  const router = useRouter();

  useAuth();

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
        ? "bg-red-900/30 text-red-400 border border-red-800"
        : "bg-red-50 text-red-700 border border-red-200";
    }
    if (quantity <= 5) {
      return darkMode
        ? "bg-orange-900/30 text-orange-400 border border-orange-800"
        : "bg-orange-50 text-orange-700 border border-orange-200";
    }
    if (quantity < 10) {
      return darkMode
        ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800"
        : "bg-yellow-50 text-yellow-700 border border-yellow-200";
    }
    return darkMode
      ? "bg-green-900/30 text-green-400 border border-green-800"
      : "bg-green-50 text-green-700 border border-green-200";
  };

  // Helper to get status icon
  const getStatusIcon = (quantity) => {
    if (quantity === 0)
      return (
        <XCircle className="w-3 h-3 animate__animated animate__headShake animate__infinite animate__slow" />
      );
    if (quantity <= 5)
      return (
        <AlertTriangle className="w-3 h-3 animate__animated animate__headShake animate__infinite animate__slow" />
      );
    if (quantity < 10) return <TrendingDown className="w-3 h-3" />;
    return <Package className="w-3 h-3" />;
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) setDarkMode(savedDarkMode === "true");

    const fetchData = async () => {
      const shippedRes = await getParcelInItems();
      const deliveryRes = await getParcelOutItems();

      if (!shippedRes.error) {
        setParcelShipped(shippedRes.data);
        setStockItems(shippedRes.data);

        // Calculate status counts from parcel_in
        const counts = {
          out: 0,
          critical: 0,
          low: 0,
          available: 0,
        };

        shippedRes.data?.forEach((item) => {
          const status = getStockStatus(item.quantity);
          counts[status]++;
        });

        setStatusCounts(counts);

        // Count only items with quantity > 0 for Stock In
        const itemsWithStock =
          shippedRes.data?.filter((item) => item.quantity > 0).length || 0;
        setParcelShippedCount(itemsWithStock);
      }

      if (!deliveryRes.error) setParcelDelivery(deliveryRes.data);

      setParcelDeliveryCount(deliveryRes.data?.length || 0);
    };

    fetchData();
  }, []);

  const handleCardClick = (route) => {
    router.push(route);
  };

  // Get items that need attention (out of stock, critical, or low)
  const itemsNeedingAttention = stockItems.filter((item) => item.quantity < 10);

  return (
    <div
      className={
        darkMode
          ? "dark min-h-screen bg-gray-900 text-white"
          : "min-h-screen bg-gray-50 text-black"
      }
    >
      {/* Top Navbar */}
      <TopNavbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
      />

      <main
        className={`pt-20 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-0"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Summary Cards - Row 1: Parcel Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Stock In - Royal Blue */}
            <div
              onClick={() => handleCardClick("/parcel-shipped")}
              className="bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] text-white p-6 rounded-xl shadow-lg animate__animated animate__fadeInUp cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-2xl active:scale-95"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Stock In</h2>
                <PackageCheck className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-4xl font-bold">{parcelShippedCount}</p>
              <p className="text-sm opacity-80 mt-1">
                Items with available stock
              </p>
            </div>

            {/* Stock Out - Orange */}
            <div
              onClick={() => handleCardClick("/parcel-delivery")}
              className="bg-gradient-to-br from-[#ea580c] to-[#c2410c] text-white p-6 rounded-xl shadow-lg animate__animated animate__fadeInUp cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-2xl active:scale-95"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Stock Out</h2>
                <PackageOpen className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-4xl font-bold">{parcelDeliveryCount}</p>
              <p className="text-sm opacity-80 mt-1">
                Total outgoing deliveries
              </p>
            </div>

            {/* Total Items - Black/Dark Blue */}
            <div
              onClick={() => handleCardClick("/out-of-stock")}
              className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-xl shadow-lg animate__animated animate__fadeInUp cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-2xl active:scale-95"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Total Items</h2>
                <Package className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-4xl font-bold">{stockItems.length}</p>
              <p className="text-sm opacity-80 mt-1">Unique items tracked</p>
            </div>
          </div>

          {/* Summary Cards - Row 2: Stock Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Out of Stock */}
            <div
              onClick={() => handleCardClick("/out-of-stock")}
              className={`p-6 rounded-xl shadow-lg animate__animated animate__fadeInUp cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 ${
                darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              }`}
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3
                  className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Out of Stock
                </h3>
                <XCircle className="w-6 h-6 text-red-500 opacity-70" />
              </div>
              <p className="text-3xl font-bold text-red-500">
                {statusCounts.out}
              </p>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-500"
                  style={{
                    width: `${stockItems.length > 0 ? (statusCounts.out / stockItems.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Critical Level - Orange */}
            <div
              onClick={() => handleCardClick("/out-of-stock")}
              className={`p-6 rounded-xl shadow-lg animate__animated animate__fadeInUp cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 ${
                darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              }`}
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3
                  className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Critical Level
                </h3>
                <AlertTriangle className="w-6 h-6 text-orange-600 opacity-70" />
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {statusCounts.critical}
              </p>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-600 transition-all duration-500"
                  style={{
                    width: `${stockItems.length > 0 ? (statusCounts.critical / stockItems.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Low Stock */}
            <div
              onClick={() => handleCardClick("/out-of-stock")}
              className={`p-6 rounded-xl shadow-lg animate__animated animate__fadeInUp cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 ${
                darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              }`}
              style={{ animationDelay: "0.5s" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3
                  className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Low Stock
                </h3>
                <TrendingDown className="w-6 h-6 text-yellow-500 opacity-70" />
              </div>
              <p className="text-3xl font-bold text-yellow-500">
                {statusCounts.low}
              </p>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all duration-500"
                  style={{
                    width: `${stockItems.length > 0 ? (statusCounts.low / stockItems.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Available - Royal Blue */}
            <div
              onClick={() => handleCardClick("/out-of-stock")}
              className={`p-6 rounded-xl shadow-lg animate__animated animate__fadeInUp cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 ${
                darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              }`}
              style={{ animationDelay: "0.6s" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3
                  className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Available
                </h3>
                <Package className="w-6 h-6 text-blue-700 opacity-70" />
              </div>
              <p className="text-3xl font-bold text-blue-700">
                {statusCounts.available}
              </p>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-700 transition-all duration-500"
                  style={{
                    width: `${stockItems.length > 0 ? (statusCounts.available / stockItems.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Alert Banner - Orange */}
          {(statusCounts.out > 0 || statusCounts.critical > 0) && (
            <div
              className={`mb-6 p-4 rounded-xl border-l-4 animate__animated animate__fadeInLeft ${
                darkMode
                  ? "bg-orange-500/10 border-orange-600 text-orange-300"
                  : "bg-orange-50 border-orange-600 text-orange-900"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 animate__animated animate__swing animate__infinite animate__slow" />
                <div>
                  <p className="font-semibold">⚠️ Inventory Alert</p>
                  <p className="text-sm opacity-90 mt-0.5">
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

          {/* Items Needing Attention Table */}
          <div
            className={`rounded-xl shadow-lg overflow-hidden mb-6 border animate__animated animate__fadeIn animate__fast ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div
              className={`px-6 py-4 border-b flex items-center gap-3 animate__animated animate__fadeInDown ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <AlertTriangle
                className={`w-6 h-6 ${darkMode ? "text-orange-400" : "text-orange-600"} animate__animated animate__bounce`}
              />
              <h2
                className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Items Needing Attention
              </h2>
              <span
                className={`ml-auto text-sm px-3 py-1 rounded-full ${
                  darkMode
                    ? "bg-orange-500/20 text-orange-400"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {itemsNeedingAttention.length} items
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead
                  className={`${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}
                >
                  <tr>
                    {["Item Name", "Current Stock", "Status", "Date Added"].map(
                      (head) => (
                        <th
                          key={head}
                          className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {head}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody
                  className={`${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
                >
                  {itemsNeedingAttention.length === 0 ? (
                    <tr className="animate__animated animate__fadeIn animate__fast">
                      <td
                        colSpan={4}
                        className={`px-6 py-16 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        <Package
                          className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"} animate__animated animate__bounce animate__infinite animate__slow`}
                        />
                        <p className="text-lg font-medium mb-1">
                          All items are well-stocked
                        </p>
                        <p className="text-sm opacity-75">
                          No items need immediate attention
                        </p>
                      </td>
                    </tr>
                  ) : (
                    itemsNeedingAttention.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`transition-all duration-200 animate__animated animate__fadeInUp ${darkMode ? (index % 2 === 0 ? "bg-gray-800" : "bg-gray-700/50 hover:bg-gray-700/70") : index % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                item.quantity === 0
                                  ? "bg-red-500"
                                  : item.quantity <= 5
                                    ? "bg-orange-600"
                                    : "bg-yellow-500"
                              } animate__animated animate__pulse animate__infinite`}
                            />
                            {item.item_name}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap font-semibold ${
                            item.quantity === 0
                              ? "text-red-500"
                              : item.quantity <= 5
                                ? "text-orange-600"
                                : "text-yellow-500"
                          }`}
                        >
                          {item.quantity} units
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              item.quantity,
                              darkMode,
                            )}`}
                          >
                            {getStatusIcon(item.quantity)}
                            {getStatusLabel(item.quantity)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.date}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Parcel Shipped & Delivery Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Parcel Shipped Table - Royal Blue accent */}
            <div
              className={`rounded-xl shadow-lg overflow-hidden border animate__animated animate__fadeIn animate__fast ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            >
              <div
                className={`px-6 py-4 border-b flex items-center gap-3 animate__animated animate__fadeInDown ${darkMode ? "border-gray-700" : "border-gray-200"}`}
              >
                <PackageCheck
                  className={`w-6 h-6 ${darkMode ? "text-blue-400" : "text-blue-700"} animate__animated animate__bounce`}
                />
                <h2
                  className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  Recent Stock In
                </h2>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="min-w-full divide-y">
                  <thead
                    className={`sticky top-0 ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}
                  >
                    <tr>
                      {["Item Name", "Quantity", "Date", "Time In"].map(
                        (head) => (
                          <th
                            key={head}
                            className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                          >
                            {head}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody
                    className={`${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
                  >
                    {parcelShipped.slice(0, 10).map((item, index) => (
                      <tr
                        key={item.id}
                        className={`transition-all duration-200 animate__animated animate__fadeInUp ${darkMode ? (index % 2 === 0 ? "bg-gray-800" : "bg-gray-700/50 hover:bg-gray-700/70") : index % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {item.item_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                          <Clock className="w-4 h-4 opacity-50" />
                          {item.time_in}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Parcel Delivery Table - Orange accent */}
            <div
              className={`rounded-xl shadow-lg overflow-hidden border animate__animated animate__fadeIn animate__fast ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            >
              <div
                className={`px-6 py-4 border-b flex items-center gap-3 animate__animated animate__fadeInDown ${darkMode ? "border-gray-700" : "border-gray-200"}`}
              >
                <PackageOpen
                  className={`w-6 h-6 ${darkMode ? "text-orange-400" : "text-orange-600"} animate__animated animate__bounce`}
                />
                <h2
                  className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  Recent Stock Out
                </h2>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="min-w-full divide-y">
                  <thead
                    className={`sticky top-0 ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}
                  >
                    <tr>
                      {["Item Name", "Quantity", "Date", "Time Out"].map(
                        (head) => (
                          <th
                            key={head}
                            className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                          >
                            {head}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody
                    className={`${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
                  >
                    {parcelDelivery.slice(0, 10).map((item, index) => (
                      <tr
                        key={item.id}
                        className={`transition-all duration-200 animate__animated animate__fadeInUp ${darkMode ? (index % 2 === 0 ? "bg-gray-800" : "bg-gray-700/50 hover:bg-gray-700/70") : index % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {item.item_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                          <Clock className="w-4 h-4 opacity-50" />
                          {item.time_out}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
