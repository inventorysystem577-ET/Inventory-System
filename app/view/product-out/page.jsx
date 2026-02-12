/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useState, useEffect } from "react";
import TopNavbar from "../../components/TopNavbar";
import Sidebar from "../../components/Sidebar";
import {
  PackageOpen,
  Plus,
  Clock,
  Calendar,
  Package,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import "animate.css";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Product Out");
  const [darkMode, setDarkMode] = useState(false);

  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [timeHour, setTimeHour] = useState("1");
  const [timeMinute, setTimeMinute] = useState("00");
  const [timeAMPM, setTimeAMPM] = useState("AM");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) setDarkMode(savedDarkMode === "true");

    const now = new Date();
    let hour = now.getHours();
    const minute = now.getMinutes();
    const ampm = hour >= 12 ? "PM" : "AM";

    // convert to 12-hour format
    hour = hour % 12;
    hour = hour ? hour : 12; // 0 becomes 12

    const formattedMinute = minute < 10 ? `0${minute}` : `${minute}`;

    setTimeHour(hour.toString());
    setTimeMinute(formattedMinute);
    setTimeAMPM(ampm);

    // Load mock data
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products_out")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        return;
      }

      const sortedData = (data || [])
        .filter((item) => item.quantity > 0)
        .sort((a, b) => b.quantity - a.quantity);

      setProducts(sortedData);
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const formatTo12Hour = (time) => {
    if (!time) return "";
    if (time.includes("AM") || time.includes("PM")) return time;

    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr);

    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12;

    return `${hour}:${minute} ${ampm}`;
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      const timeOut = `${timeHour}:${timeMinute} ${timeAMPM}`;

      // Insert into database
      const { data: newProduct, error } = await supabase
        .from("products_out")
        .insert([
          {
            product_name: productName,
            category: category,
            quantity: parseInt(quantity),
            date: date,
            order_number: orderNumber,
            time_out: timeOut,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding product:", error);
        alert("Failed to add product");
        return;
      }

      // Refresh the list from database
      await loadProducts();

      // Reset form
      setProductName("");
      setCategory("");
      setQuantity(1);
      setDate("");
      setOrderNumber("");
      setTimeHour("1");
      setTimeMinute("00");
      setTimeAMPM("AM");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An error occurred while adding product");
    }
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div
      className={
        darkMode
          ? "dark min-h-screen bg-[#0B0B0B] text-white"
          : "min-h-screen bg-[#F9FAFB] text-black"
      }
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

      {/* Main */}
      <main
        className={`pt-20 transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : ""
        }`}
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
                <PackageOpen
                  className={`w-6 h-6 ${
                    darkMode ? "text-[#3B82F6]" : "text-[#1E3A8A]"
                  }`}
                />
                <h1 className="text-3xl font-bold tracking-wide">
                  Product Out
                </h1>
              </div>
              <div
                className={`flex-1 h-[2px] ${
                  darkMode ? "bg-[#374151]" : "bg-[#D1D5DB]"
                }`}
              ></div>
            </div>
            <p
              className={`text-center text-sm ${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}
            >
              Track outgoing products and deliveries
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleAddProduct}
            className={`p-6 rounded-xl shadow-lg mb-8 border transition animate__animated animate__fadeInUp animate__faster ${
              darkMode
                ? "bg-[#1F2937] border-[#374151] text-white"
                : "bg-white border-[#E5E7EB] text-[#111827]"
            }`}
          >
            <div className="flex items-center gap-2 mb-6">
              <Plus
                className={`w-5 h-5 ${
                  darkMode ? "text-[#3B82F6]" : "text-[#1E3A8A]"
                }`}
              />
              <h2 className={`text-lg font-semibold`}>Add New Product Out</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
              {/* Product Name */}
              <div>
                <label
                  className={`text-sm font-medium mb-2 flex items-center gap-1.5 ${
                    darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                  }`}
                >
                  <Package className="w-4 h-4" /> Product Name
                </label>
                <input
                  type="text"
                  placeholder="Product name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className={`border rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 transition-all ${
                    darkMode
                      ? "border-[#374151] focus:ring-[#3B82F6] focus:border-[#3B82F6] bg-[#111827] text-white placeholder-[#6B7280]"
                      : "border-[#D1D5DB] focus:ring-[#1E3A8A] focus:border-[#1E3A8A] bg-white text-black placeholder-[#9CA3AF]"
                  }`}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label
                  className={`text-sm font-medium mb-2 flex items-center gap-1.5 ${
                    darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                  }`}
                >
                  <Package className="w-4 h-4" /> Category
                </label>
                <input
                  type="text"
                  placeholder="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`border rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 transition-all ${
                    darkMode
                      ? "border-[#374151] focus:ring-[#3B82F6] focus:border-[#3B82F6] bg-[#111827] text-white placeholder-[#6B7280]"
                      : "border-[#D1D5DB] focus:ring-[#1E3A8A] focus:border-[#1E3A8A] bg-white text-black placeholder-[#9CA3AF]"
                  }`}
                  required
                />
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
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`border rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 transition-all ${
                    darkMode
                      ? "border-[#374151] focus:ring-[#3B82F6] focus:border-[#3B82F6] bg-[#111827] text-white"
                      : "border-[#D1D5DB] focus:ring-[#1E3A8A] focus:border-[#1E3A8A] bg-white text-black"
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
                  className={`border rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 transition-all ${
                    darkMode
                      ? "border-[#374151] focus:ring-[#3B82F6] focus:border-[#3B82F6] bg-[#111827] text-white"
                      : "border-[#D1D5DB] focus:ring-[#1E3A8A] focus:border-[#1E3A8A] bg-white text-black"
                  }`}
                  required
                />
              </div>

              {/* Order Number */}
              <div>
                <label
                  className={`text-sm font-medium mb-2 flex items-center gap-1.5 ${
                    darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                  }`}
                >
                  <FileText className="w-4 h-4" /> Order Number
                </label>
                <input
                  type="text"
                  placeholder="Order number"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className={`border rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 transition-all ${
                    darkMode
                      ? "border-[#374151] focus:ring-[#3B82F6] focus:border-[#3B82F6] bg-[#111827] text-white placeholder-[#6B7280]"
                      : "border-[#D1D5DB] focus:ring-[#1E3A8A] focus:border-[#1E3A8A] bg-white text-black placeholder-[#9CA3AF]"
                  }`}
                  required
                />
              </div>

              {/* Time Out */}
              <div className="lg:col-span-3">
                <label
                  className={`text-sm font-medium mb-2 flex items-center gap-1.5 ${
                    darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                  }`}
                >
                  <Clock className="w-4 h-4" /> Time Out
                </label>
                <div className="flex gap-2">
                  <select
                    value={timeHour}
                    onChange={(e) => setTimeHour(e.target.value)}
                    className={`border rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 transition-all ${
                      darkMode
                        ? "border-[#374151] focus:ring-[#3B82F6] focus:border-[#3B82F6] bg-[#111827] text-white"
                        : "border-[#D1D5DB] focus:ring-[#1E3A8A] focus:border-[#1E3A8A] bg-white text-black"
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
                    className={`border rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 transition-all ${
                      darkMode
                        ? "border-[#374151] focus:ring-[#3B82F6] focus:border-[#3B82F6] bg-[#111827] text-white"
                        : "border-[#D1D5DB] focus:ring-[#1E3A8A] focus:border-[#1E3A8A] bg-white text-black"
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
                    className={`border rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 transition-all ${
                      darkMode
                        ? "border-[#374151] focus:ring-[#3B82F6] focus:border-[#3B82F6] bg-[#111827] text-white"
                        : "border-[#D1D5DB] focus:ring-[#1E3A8A] focus:border-[#1E3A8A] bg-white text-black"
                    }`}
                  >
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" /> Add Product
              </button>
            </div>
          </form>

          {/* Stats */}
          <div
            className={`mb-6 flex justify-between p-4 rounded-lg shadow animate__animated animate__fadeInUp animate__fast ${
              darkMode
                ? "bg-[#1F2937] text-white border border-[#374151]"
                : "bg-white text-[#111827] border border-[#E5E7EB]"
            }`}
          >
            <div className="font-medium">
              Total Products:{" "}
              <span className="font-bold">{products.length}</span>
            </div>
            <div className="font-medium">
              Total Quantity:{" "}
              <span className="font-bold">
                {products.reduce((sum, item) => sum + Number(item.quantity), 0)}
              </span>
            </div>
          </div>

          {/* Table */}
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
                      "CATEGORY",
                      "QUANTITY",
                      "DATE",
                      "ORDER NUMBER",
                      "TIME OUT",
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
                  className={darkMode ? "divide-[#374151]" : "divide-[#E5E7EB]"}
                >
                  {currentItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className={`text-center p-8 sm:p-12 ${
                          darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
                        } animate__animated animate__fadeIn`}
                      >
                        <PackageOpen
                          className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 animate__animated animate__fadeIn ${
                            darkMode ? "text-[#6B7280]" : "text-[#D1D5DB]"
                          }`}
                        />
                        <p className="text-base sm:text-lg font-medium mb-1">
                          No products shipped yet
                        </p>
                        <p className="text-xs sm:text-sm opacity-75">
                          Add your first product using the form above
                        </p>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((product, index) => (
                      <tr
                        key={product.id}
                        className={`border-t transition animate__animated animate__fadeIn animate__faster ${
                          darkMode
                            ? "border-[#374151] hover:bg-[#374151]/40"
                            : "border-[#E5E7EB] hover:bg-[#F3F4F6]"
                        }`}
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <td className="p-3 sm:p-4 font-semibold text-sm sm:text-base whitespace-nowrap">
                          {product.product_name}
                        </td>
                        <td className="p-3 sm:p-4 text-sm sm:text-base whitespace-nowrap">
                          {product.category}
                        </td>
                        <td className="p-3 sm:p-4">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-lg font-bold text-xs sm:text-sm ${
                              darkMode
                                ? "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30"
                                : "bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]"
                            }`}
                          >
                            {product.quantity}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-sm sm:text-base whitespace-nowrap">
                          {product.date}
                        </td>
                        <td className="p-3 sm:p-4 text-sm sm:text-base whitespace-nowrap">
                          {product.order_number}
                        </td>
                        <td className="p-3 sm:p-4 text-sm sm:text-base whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="sm:w-4 sm:h-4" />{" "}
                            {formatTo12Hour(product.time_out)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {products.length > 5 && (
              <div
                className={`flex items-center justify-between px-4 py-3 border-t ${
                  darkMode ? "border-[#374151]" : "border-[#E5E7EB]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}
                  >
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, products.length)} of{" "}
                    {products.length} entries
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
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

                  {/* Page Numbers */}
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
                              ? "bg-[#1E3A8A] text-white shadow-md"
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

                  {/* Next Button */}
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
  );
}
