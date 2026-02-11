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

import { fetchParcelItems } from "../utils/parcelShippedHelper"; // parcel_in (client helper)
import { fetchParcelOutItems } from "../utils/parcelOutHelper"; // parcel_out (client helper)

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
      const shippedRes = await fetchParcelItems();
      const deliveryRes = await fetchParcelOutItems();

      setParcelShipped(shippedRes || []);
      setStockItems(shippedRes || []);

      // Calculate status counts from parcel_in
      const counts = { out: 0, critical: 0, low: 0, available: 0 };
      (shippedRes || []).forEach((item) => {
        const status = getStockStatus(item.quantity);
        counts[status]++;
      });

      setStatusCounts(counts);

      const itemsWithStock =
        (shippedRes || []).filter((item) => item.quantity > 0).length || 0;
      setParcelShippedCount(itemsWithStock);

      setParcelDelivery(deliveryRes || []);
      setParcelDeliveryCount((deliveryRes || []).length || 0);
    };

    fetchData();
  }, []);

  const handleCardClick = (route, status = null) => {
    if (status) {
      router.push(`${route}?status=${status}`);
    } else {
      router.push(route);
    }
  };

  // Get items that need attention (out of stock, critical, or low)
  const itemsNeedingAttention = stockItems.filter((item) => item.quantity < 10);

  return (
    <div
      className={
        darkMode
          ? "dark min-h-screen bg-[#0B0B0B] text-white"
          : "min-h-screen bg-[#F9FAFB] text-black"
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
              onClick={() => handleCardClick("/view/parcel-shipped")}
              className="bg-gradient-to-br from-[#1D4ED8] to-[#1E3A8A] text-white p-6 rounded-xl shadow-lg animate__animated animate__fadeInUp cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-2xl active:scale-95"
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
              onClick={() => handleCardClick("/view/parcel-delivery")}
              className="bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white p-6 rounded-xl shadow-lg animate__animated animate__fadeInUp cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-2xl active:scale-95"
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

            {/* Total Items - Black/Dark Gray */}
            <div
              onClick={() => handleCardClick("/view/out-of-stock")}
              className={`p-6 rounded-xl shadow-lg animate__animated animate__fadeInUp cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-2xl active:scale-95 ${
                darkMode
                  ? "bg-gradient-to-br from-[#111111] to-[#0B0B0B] text-white border border-[#374151]"
                  : "bg-gradient-to-br from-[#111827] to-[#000000] text-white"
              }`}
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
              onClick={() => handleCardClick("/view/out-of-stock", "out")}
              className={`p-6 rounded-xl shadow-lg animate__animated animate__fadeInUp cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 ${
                darkMode
                  ? "bg-[#1F2937] border border-[#374151]"
                  : "bg-white border border-[#E5E7EB]"
              }`}
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3
                  className={`text-sm font-medium ${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}
                >
                  Out of Stock
                </h3>
                <XCircle className="w-6 h-6 text-[#EF4444] opacity-70" />
              </div>
              <p className="text-3xl font-bold text-[#EF4444]">
                {statusCounts.out}
              </p>
              <div
                className={`mt-2 h-2 rounded-full overflow-hidden ${darkMode ? "bg-[#374151]" : "bg-[#E5E7EB]"}`}
              >
                <div
                  className="h-full bg-[#EF4444] transition-all duration-500"
                  style={{
                    width: `${stockItems.length > 0 ? (statusCounts.out / stockItems.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Critical Level - Orange */}
            <div
              onClick={() => handleCardClick("/view/out-of-stock", "critical")}
              className={`p-6 rounded-xl shadow-lg animate__animated animate__fadeInUp cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 ${
                darkMode
                  ? "bg-[#1F2937] border border-[#374151]"
                  : "bg-white border border-[#E5E7EB]"
              }`}
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3
                  className={`text-sm font-medium ${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}
                >
                  Critical Level
                </h3>
                <AlertTriangle className="w-6 h-6 text-[#F97316] opacity-70" />
              </div>
              <p className="text-3xl font-bold text-[#F97316]">
                {statusCounts.critical}
              </p>
              <div
                className={`mt-2 h-2 rounded-full overflow-hidden ${darkMode ? "bg-[#374151]" : "bg-[#E5E7EB]"}`}
              >
                <div
                  className="h-full bg-[#F97316] transition-all duration-500"
                  style={{
                    width: `${stockItems.length > 0 ? (statusCounts.critical / stockItems.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Low Stock */}
            <div
              onClick={() => handleCardClick("/view/out-of-stock", "low")}
              className={`p-6 rounded-xl shadow-lg animate__animated animate__fadeInUp cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 ${
                darkMode
                  ? "bg-[#1F2937] border border-[#374151]"
                  : "bg-white border border-[#E5E7EB]"
              }`}
              style={{ animationDelay: "0.5s" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3
                  className={`text-sm font-medium ${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}
                >
                  Low Stock
                </h3>
                <TrendingDown className="w-6 h-6 text-[#FACC15] opacity-70" />
              </div>
              <p className="text-3xl font-bold text-[#FACC15]">
                {statusCounts.low}
              </p>
              <div
                className={`mt-2 h-2 rounded-full overflow-hidden ${darkMode ? "bg-[#374151]" : "bg-[#E5E7EB]"}`}
              >
                <div
                  className="h-full bg-[#FACC15] transition-all duration-500"
                  style={{
                    width: `${stockItems.length > 0 ? (statusCounts.low / stockItems.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Available - Royal Blue */}
            <div
              onClick={() => handleCardClick("/view/out-of-stock", "available")}
              className={`p-6 rounded-xl shadow-lg animate__animated animate__fadeInUp cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 ${
                darkMode
                  ? "bg-[#1F2937] border border-[#374151]"
                  : "bg-white border border-[#E5E7EB]"
              }`}
              style={{ animationDelay: "0.6s" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3
                  className={`text-sm font-medium ${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}
                >
                  Available
                </h3>
                <Package className="w-6 h-6 text-[#3B82F6] opacity-70" />
              </div>
              <p className="text-3xl font-bold text-[#3B82F6]">
                {statusCounts.available}
              </p>
              <div
                className={`mt-2 h-2 rounded-full overflow-hidden ${darkMode ? "bg-[#374151]" : "bg-[#E5E7EB]"}`}
              >
                <div
                  className="h-full bg-[#3B82F6] transition-all duration-500"
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
                  ? "bg-[#F97316]/10 border-[#F97316] text-[#F97316]"
                  : "bg-[#FFEDD5] border-[#F97316] text-[#EA580C]"
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
                ? "bg-[#1F2937] border-[#374151]"
                : "bg-white border-[#E5E7EB]"
            }`}
          >
            <div
              className={`px-6 py-4 border-b flex items-center gap-3 animate__animated animate__fadeInDown ${
                darkMode ? "border-[#374151]" : "border-[#E5E7EB]"
              }`}
            >
              <AlertTriangle
                className={`w-6 h-6 ${darkMode ? "text-[#F97316]" : "text-[#EA580C]"} animate__animated animate__bounce`}
              />
              <h2
                className={`text-xl font-semibold ${darkMode ? "text-white" : "text-[#111827]"}`}
              >
                Items Needing Attention
              </h2>
              <span
                className={`ml-auto text-sm px-3 py-1 rounded-full ${
                  darkMode
                    ? "bg-[#F97316]/20 text-[#F97316]"
                    : "bg-[#FFEDD5] text-[#EA580C]"
                }`}
              >
                {itemsNeedingAttention.length} items
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead
                  className={`${darkMode ? "bg-[#111827]" : "bg-[#F9FAFB]"}`}
                >
                  <tr>
                    {["Item Name", "Current Stock", "Status", "Date Added"].map(
                      (head) => (
                        <th
                          key={head}
                          className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-[#D1D5DB]" : "text-[#374151]"}`}
                        >
                          {head}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody
                  className={`${darkMode ? "divide-[#374151]" : "divide-[#E5E7EB]"}`}
                >
                  {itemsNeedingAttention.length === 0 ? (
                    <tr className="animate__animated animate__fadeIn animate__fast">
                      <td
                        colSpan={4}
                        className={`px-6 py-16 text-center ${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}
                      >
                        <Package
                          className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-[#6B7280]" : "text-[#D1D5DB]"} animate__animated animate__bounce animate__infinite animate__slow`}
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
                        className={`transition-all duration-200 animate__animated animate__fadeInUp ${
                          darkMode
                            ? index % 2 === 0
                              ? "bg-[#1F2937]"
                              : "bg-[#111827] hover:bg-[#374151]"
                            : index % 2 === 0
                              ? "bg-white"
                              : "bg-[#F9FAFB] hover:bg-[#F3F4F6]"
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                item.quantity === 0
                                  ? "bg-[#EF4444]"
                                  : item.quantity <= 5
                                    ? "bg-[#F97316]"
                                    : "bg-[#FACC15]"
                              } animate__animated animate__pulse animate__infinite`}
                            />
                            {item.name}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap font-semibold ${
                            item.quantity === 0
                              ? "text-[#EF4444]"
                              : item.quantity <= 5
                                ? "text-[#F97316]"
                                : "text-[#FACC15]"
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
              className={`rounded-xl shadow-lg overflow-hidden border animate__animated animate__fadeIn animate__fast ${darkMode ? "bg-[#1F2937] border-[#374151]" : "bg-white border-[#E5E7EB]"}`}
            >
              <div
                className={`px-6 py-4 border-b flex items-center gap-3 animate__animated animate__fadeInDown ${darkMode ? "border-[#374151]" : "border-[#E5E7EB]"}`}
              >
                <PackageCheck
                  className={`w-6 h-6 ${darkMode ? "text-[#3B82F6]" : "text-[#1E3A8A]"} animate__animated animate__bounce`}
                />
                <h2
                  className={`text-xl font-semibold ${darkMode ? "text-white" : "text-[#111827]"}`}
                >
                  Recent Stock In
                </h2>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="min-w-full divide-y">
                  <thead
                    className={`sticky top-0 ${darkMode ? "bg-[#111827]" : "bg-[#F9FAFB]"}`}
                  >
                    <tr>
                      {["Item Name", "Quantity", "Date", "Time In"].map(
                        (head) => (
                          <th
                            key={head}
                            className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-[#D1D5DB]" : "text-[#374151]"}`}
                          >
                            {head}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody
                    className={`${darkMode ? "divide-[#374151]" : "divide-[#E5E7EB]"}`}
                  >
                    {parcelShipped.slice(0, 10).map((item, index) => (
                      <tr
                        key={item.id}
                        className={`transition-all duration-200 animate__animated animate__fadeInUp ${
                          darkMode
                            ? index % 2 === 0
                              ? "bg-[#1F2937]"
                              : "bg-[#111827] hover:bg-[#374151]"
                            : index % 2 === 0
                              ? "bg-white"
                              : "bg-[#F9FAFB] hover:bg-[#F3F4F6]"
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                          <Clock className="w-4 h-4 opacity-50" />
                          {item.timeIn}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Parcel Delivery Table - Orange accent */}
            <div
              className={`rounded-xl shadow-lg overflow-hidden border animate__animated animate__fadeIn animate__fast ${darkMode ? "bg-[#1F2937] border-[#374151]" : "bg-white border-[#E5E7EB]"}`}
            >
              <div
                className={`px-6 py-4 border-b flex items-center gap-3 animate__animated animate__fadeInDown ${darkMode ? "border-[#374151]" : "border-[#E5E7EB]"}`}
              >
                <PackageOpen
                  className={`w-6 h-6 ${darkMode ? "text-[#F97316]" : "text-[#EA580C]"} animate__animated animate__bounce`}
                />
                <h2
                  className={`text-xl font-semibold ${darkMode ? "text-white" : "text-[#111827]"}`}
                >
                  Recent Stock Out
                </h2>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="min-w-full divide-y">
                  <thead
                    className={`sticky top-0 ${darkMode ? "bg-[#111827]" : "bg-[#F9FAFB]"}`}
                  >
                    <tr>
                      {["Item Name", "Quantity", "Date", "Time Out"].map(
                        (head) => (
                          <th
                            key={head}
                            className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-[#D1D5DB]" : "text-[#374151]"}`}
                          >
                            {head}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody
                    className={`${darkMode ? "divide-[#374151]" : "divide-[#E5E7EB]"}`}
                  >
                    {parcelDelivery.slice(0, 10).map((item, index) => (
                      <tr
                        key={item.id}
                        className={`transition-all duration-200 animate__animated animate__fadeInUp ${
                          darkMode
                            ? index % 2 === 0
                              ? "bg-[#1F2937]"
                              : "bg-[#111827] hover:bg-[#374151]"
                            : index % 2 === 0
                              ? "bg-white"
                              : "bg-[#F9FAFB] hover:bg-[#F3F4F6]"
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                          <Clock className="w-4 h-4 opacity-50" />
                          {item.timeOut}
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
