/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useState, useEffect } from "react";
import TopNavbar from "../../components/TopNavbar";
import Sidebar from "../../components/Sidebar";
import {
  PackageCheck,
  Plus,
  Clock,
  Calendar,
  Package,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "animate.css";
import {
  fetchProductInController,
  handleAddProductIn,
} from "../../controller/productController";
import { products } from "../../utils/productsData";
import AuthGuard from "../../components/AuthGuard";

export default function ProductInPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("product-in");
  const [darkMode, setDarkMode] = useState(false);

  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState(1);
  const [date, setDate] = useState("");
  const [timeHour, setTimeHour] = useState("1");
  const [timeMinute, setTimeMinute] = useState("00");
  const [timeAMPM, setTimeAMPM] = useState("AM");
  const [price, setPrice] = useState("");
  const [errorBar, setErrorBar] = useState("");
  const [successBar, setSuccessBar] = useState("");
  const [alternativeRequest, setAlternativeRequest] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) setDarkMode(savedDarkMode === "true");

    const now = new Date();
    let hour = now.getHours();
    const minute = now.getMinutes();
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    setTimeHour(hour.toString());
    setTimeMinute(minute < 10 ? `0${minute}` : `${minute}`);
    setTimeAMPM(ampm);

    loadItems();
  }, []);

  const loadItems = async () => {
    const data = await fetchProductInController();
    const sanitizedData = data.map((item) => ({
      ...item,
      components: Array.isArray(item.components) ? item.components : [],
    }));
    setItems(sanitizedData.sort((a, b) => b.id - a.id));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !qty || !date) return;

    const quantityToAdd = parseInt(qty);
    const product = products.find(
      (p) =>
        p.name.toLowerCase().trim() === selectedProduct.toLowerCase().trim(),
    );
    if (!product) return;

    const components = product.components.map((c) => ({
      name: c.name,
      quantity: c.baseQty * quantityToAdd,
    }));

    const time_in = `${timeHour}:${timeMinute} ${timeAMPM}`;
    setErrorBar("");
    setSuccessBar("");
    setAlternativeRequest(null);

    const result = await handleAddProductIn(
      selectedProduct,
      quantityToAdd,
      date,
      time_in,
      components,
      {
        price,
      },
    );

    if (!result?.success) {
      if (result?.requiresAlternativeApproval) {
        setAlternativeRequest({
          product_name: selectedProduct,
          quantity: quantityToAdd,
          date,
          time_in,
          components,
          alternatives: result.alternativeOptions || [],
        });
        return;
      }

      const missingText =
        result?.missingComponents?.length > 0
          ? ` Missing: ${result.missingComponents
              .map((item) => `${item.component} (${item.available}/${item.needed})`)
              .join(", ")}`
          : "";

      setErrorBar(`${result?.message || "Unable to add Product In."}${missingText}`);
      return;
    }

    const altText =
      result.usedAlternatives?.length > 0
        ? ` Used alternatives: ${result.usedAlternatives
            .map((item) => `${item.alternative} for ${item.forComponent} (${item.quantity})`)
            .join(", ")}`
        : "";
    setSuccessBar(`Product IN added and components deducted from Stock In.${altText}`);

    await loadItems();

    setSelectedProduct("");
    setQty(1);
    setDate("");
    setTimeHour("1");
    setTimeMinute("00");
    setTimeAMPM("AM");
    setPrice("");
  };

  const handleUseAlternatives = async () => {
    if (!alternativeRequest) return;

    setErrorBar("");
    setSuccessBar("");

    const result = await handleAddProductIn(
      alternativeRequest.product_name,
      alternativeRequest.quantity,
      alternativeRequest.date,
      alternativeRequest.time_in,
      alternativeRequest.components,
      {
        price,
      },
      { allowAlternatives: true },
    );

    if (!result?.success) {
      const missingText =
        result?.missingComponents?.length > 0
          ? ` Missing: ${result.missingComponents
              .map((item) => `${item.component} (${item.available}/${item.needed})`)
              .join(", ")}`
          : "";
      setErrorBar(`${result?.message || "Unable to add Product In."}${missingText}`);
      return;
    }

    const altText =
      result.usedAlternatives?.length > 0
        ? ` Used alternatives: ${result.usedAlternatives
            .map((item) => `${item.alternative} for ${item.forComponent} (${item.quantity})`)
            .join(", ")}`
        : "";
    setSuccessBar(`Product IN added using alternative materials.${altText}`);
    setAlternativeRequest(null);
    await loadItems();

    setSelectedProduct("");
    setQty(1);
    setDate("");
    setTimeHour("1");
    setTimeMinute("00");
    setTimeAMPM("AM");
    setPrice("");
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++)
          pageNumbers.push(i);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const formatTo12Hour = (time) => {
    if (!time) return "";
    if (time.includes("AM") || time.includes("PM")) return time;
    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  return (
    <AuthGuard darkMode={darkMode}>
      <div
        className={`flex flex-col w-full h-screen overflow-hidden ${
          darkMode ? "dark bg-[#0B0B0B] text-white" : "bg-[#F9FAFB] text-black"
        }`}
      >
        {/* Navbar */}
        <div
          className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b shadow-sm animate__animated animate__fadeInDown animate__faster ${
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

        {/* Main scrollable content */}
        <main
          className={`flex-1 overflow-y-auto pt-20 transition-all duration-300 ${
            sidebarOpen ? "lg:ml-64" : ""
          } ${darkMode ? "bg-[#0B0B0B]" : "bg-[#F9FAFB]"}`}
        >
          <div className="max-w-[1200px] mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-10 animate__animated animate__fadeInDown animate__faster">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div
                  className={`flex-1 h-[2px] ${
                    darkMode ? "bg-[#374151]" : "bg-[#D1D5DB]"
                  }`}
                ></div>
                <div className="flex items-center gap-2 px-3">
                  <PackageCheck
                    className={`w-6 h-6 ${
                      darkMode ? "text-[#3B82F6]" : "text-[#1E3A8A]"
                    }`}
                  />
                  <h1 className="text-3xl font-bold tracking-wide">
                    Product In
                  </h1>
                </div>
                <div
                  className={`flex-1 h-[2px] ${
                    darkMode ? "bg-[#374151]" : "bg-[#D1D5DB]"
                  }`}
                ></div>
              </div>
              <p
                className={`text-center text-sm ${
                  darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
                }`}
              >
                Record new products added to your inventory
              </p>
            </div>

            {/* Add Item Form */}
            <form
              onSubmit={handleAddItem}
              className={`p-6 rounded-xl shadow-lg mb-8 border transition animate__animated animate__fadeInUp animate__faster ${
                darkMode
                  ? "bg-[#1F2937] border-[#374151]"
                  : "bg-white border-[#E5E7EB]"
              }`}
            >
              {errorBar && (
                <div
                  className={`mb-4 rounded-lg border px-4 py-3 text-sm flex items-start gap-2 ${
                    darkMode
                      ? "bg-red-900/20 border-red-800 text-red-300"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5" />
                  <span>{errorBar}</span>
                </div>
              )}

              {successBar && (
                <div
                  className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                    darkMode
                      ? "bg-green-900/20 border-green-800 text-green-300"
                      : "bg-green-50 border-green-200 text-green-700"
                  }`}
                >
                  {successBar}
                </div>
              )}

              {alternativeRequest && (
                <div
                  className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                    darkMode
                      ? "bg-yellow-900/20 border-yellow-800 text-yellow-300"
                      : "bg-yellow-50 border-yellow-200 text-yellow-700"
                  }`}
                >
                  <p className="mb-2 font-semibold">
                    Alternative material available in Stock In.
                  </p>
                  <p className="mb-3">
                    {alternativeRequest.alternatives
                      .map((item) => {
                        const suggestions = item.suggestions
                          .map((alt) => `${alt.name} (${alt.available})`)
                          .join(", ");
                        return `${item.component}: ${suggestions}`;
                      })
                      .join(" | ")}
                  </p>
                  <button
                    type="button"
                    onClick={handleUseAlternatives}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-yellow-600 hover:bg-yellow-700 text-white transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Use Alternatives
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                {/* Product */}
                <div>
                  <label
                    className={`text-sm font-medium mb-2 flex items-center gap-1.5 ${
                      darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                    }`}
                  >
                    <Package className="w-4 h-4" /> Product Name
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 transition-all ${
                      darkMode
                        ? "border-[#374151] focus:ring-[#3B82F6] bg-[#111827] text-white"
                        : "border-[#D1D5DB] focus:ring-[#1E3A8A] bg-white text-black"
                    }`}
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label
                    className={`text-sm font-medium mb-2 flex items-center gap-1.5 ${
                      darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                    }`}
                  >
                    <Package className="w-4 h-4" /> Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 transition-all ${
                      darkMode
                        ? "border-[#374151] focus:ring-[#3B82F6] bg-[#111827] text-white"
                        : "border-[#D1D5DB] focus:ring-[#1E3A8A] bg-white text-black"
                    }`}
                    required
                  />
                </div>

                {/* Date */}
                <div>
                  <label
                    className={`text-sm font-medium mb-2 flex items-center gap-1.5 ${
                      darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                    }`}
                  >
                    <Calendar className="w-4 h-4" /> Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 transition-all ${
                      darkMode
                        ? "border-[#374151] focus:ring-[#3B82F6] bg-[#111827] text-white"
                        : "border-[#D1D5DB] focus:ring-[#1E3A8A] bg-white text-black"
                    }`}
                    required
                  />
                </div>

                {/* Time In */}
                <div>
                  <label
                    className={`text-sm font-medium mb-2 flex items-center gap-1.5 ${
                      darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                    }`}
                  >
                    <Clock className="w-4 h-4" /> Time In
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={timeHour}
                      onChange={(e) => setTimeHour(e.target.value)}
                      className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 transition-all ${
                        darkMode
                          ? "border-[#374151] focus:ring-[#3B82F6] bg-[#111827] text-white"
                          : "border-[#D1D5DB] focus:ring-[#1E3A8A] bg-white text-black"
                      }`}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <select
                      value={timeMinute}
                      onChange={(e) => setTimeMinute(e.target.value)}
                      className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 transition-all ${
                        darkMode
                          ? "border-[#374151] focus:ring-[#3B82F6] bg-[#111827] text-white"
                          : "border-[#D1D5DB] focus:ring-[#1E3A8A] bg-white text-black"
                      }`}
                    >
                      {Array.from({ length: 60 }, (_, i) => {
                        const val = i < 10 ? `0${i}` : `${i}`;
                        return (
                          <option key={i} value={val}>
                            {val}
                          </option>
                        );
                      })}
                    </select>
                    <select
                      value={timeAMPM}
                      onChange={(e) => setTimeAMPM(e.target.value)}
                      className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 transition-all ${
                        darkMode
                          ? "border-[#374151] focus:ring-[#3B82F6] bg-[#111827] text-white"
                          : "border-[#D1D5DB] focus:ring-[#1E3A8A] bg-white text-black"
                      }`}
                    >
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-4">
                <div>
                  <label
                    className={`text-sm font-medium mb-2 ${
                      darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                    }`}
                  >
                    Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 transition-all ${
                      darkMode
                        ? "border-[#374151] focus:ring-[#3B82F6] bg-[#111827] text-white"
                        : "border-[#D1D5DB] focus:ring-[#1E3A8A] bg-white text-black"
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-md transition-all duration-200 hover:shadow-lg"
                >
                  <Plus className="w-5 h-5" /> Add Product
                </button>
              </div>
            </form>

            {/* Product Table */}
            <div
              className={`rounded-xl shadow-xl overflow-hidden border transition animate__animated animate__fadeInUp animate__fast ${
                darkMode
                  ? "bg-[#1F2937] border-[#374151]"
                  : "bg-white border-[#E5E7EB]"
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead
                    className={`${
                      darkMode
                        ? "bg-[#111827] text-[#D1D5DB]"
                        : "bg-[#F9FAFB] text-[#374151]"
                    }`}
                  >
                    <tr>
                      {[
                        "PRODUCT NAME",
                        "QUANTITY",
                        "DATE",
                        "TIME IN",
                        "PRICE",
                        "COMPONENTS",
                      ].map((head) => (
                        <th
                          key={head}
                          className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    className={
                      darkMode ? "divide-[#374151]" : "divide-[#E5E7EB]"
                    }
                  >
                    {currentItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className={`text-center p-8 sm:p-12 ${
                            darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
                          } animate__animated animate__fadeIn`}
                        >
                          <PackageCheck
                            className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 animate__animated animate__fadeIn ${
                              darkMode ? "text-[#6B7280]" : "text-[#D1D5DB]"
                            }`}
                          />
                          <p className="text-base sm:text-lg font-medium mb-1">
                            No products added yet
                          </p>
                          <p className="text-xs sm:text-sm opacity-75">
                            Add your first product using the form above
                          </p>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`border-t transition animate__animated animate__fadeIn animate__faster ${
                            darkMode
                              ? "border-[#374151] hover:bg-[#374151]/40"
                              : "border-[#E5E7EB] hover:bg-[#F3F4F6]"
                          }`}
                          style={{ animationDelay: `${index * 0.03}s` }}
                        >
                          <td className="p-3 sm:p-4 font-semibold text-sm sm:text-base whitespace-nowrap">
                            {item.product_name}
                          </td>
                          <td className="p-3 sm:p-4">
                            <span
                              className={`px-2 sm:px-3 py-1 rounded-lg font-bold text-xs sm:text-sm ${
                                darkMode
                                  ? "bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30"
                                  : "bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]"
                              }`}
                            >
                              {item.quantity}
                            </span>
                          </td>
                          <td className="p-3 sm:p-4 whitespace-nowrap">
                            {item.date}
                          </td>
                          <td className="p-3 sm:p-4 whitespace-nowrap flex items-center gap-2">
                            <Clock size={14} /> {formatTo12Hour(item.time_in)}
                          </td>
                          <td className="p-3 sm:p-4 whitespace-nowrap">
                            {item.price !== null && item.price !== undefined
                              ? Number(item.price).toFixed(2)
                              : "-"}
                          </td>
                          <td className="p-3 sm:p-4">
                            {item.components.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {item.components.map((c, i) => (
                                  <span
                                    key={i}
                                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                      darkMode
                                        ? "bg-blue-800 text-blue-100"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {c.quantity} - {c.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span
                                className={
                                  darkMode ? "text-gray-500" : "text-gray-400"
                                }
                              >
                                -
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {items.length > itemsPerPage && (
                <div
                  className={`flex items-center justify-between px-4 py-3 border-t ${
                    darkMode ? "border-[#374151]" : "border-[#E5E7EB]"
                  }`}
                >
                  <div
                    className={`text-sm ${
                      darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
                    }`}
                  >
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, items.length)} of {items.length}{" "}
                    entries
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-all ${
                        currentPage === 1
                          ? darkMode
                            ? "bg-[#374151] text-[#6B7280] cursor-not-allowed"
                            : "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
                          : darkMode
                            ? "bg-[#374151] text-[#D1D5DB] hover:bg-[#4B5563]"
                            : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((pageNum, idx) =>
                        pageNum === "..." ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className={`px-3 py-2 ${
                              darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
                            }`}
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum)}
                            className={`px-3 py-2 rounded-lg font-medium transition-all ${
                              currentPage === pageNum
                                ? "bg-[#1E40AF] text-white shadow-md"
                                : darkMode
                                  ? "bg-[#374151] text-[#D1D5DB] hover:bg-[#4B5563]"
                                  : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ),
                      )}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg transition-all ${
                        currentPage === totalPages
                          ? darkMode
                            ? "bg-[#374151] text-[#6B7280] cursor-not-allowed"
                            : "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
                          : darkMode
                            ? "bg-[#374151] text-[#D1D5DB] hover:bg-[#4B5563]"
                            : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
