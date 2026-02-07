/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useState, useEffect } from "react";
import TopNavbar from "../components/TopNavbar";
import Sidebar from "../components/Sidebar";
import {
  PackageCheck,
  Plus,
  Clock,
  Calendar,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "animate.css";
import { fetchParcelItems, addParcelItem } from "../utils/parcelShippedHelper";

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("parcel-in");
  const [darkMode, setDarkMode] = useState(false);

  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [timeHour, setTimeHour] = useState("1");
  const [timeMinute, setTimeMinute] = useState("00");
  const [timeAMPM, setTimeAMPM] = useState("AM");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) setDarkMode(savedDarkMode === "true");
    loadItems();
  }, []);

  const loadItems = async () => {
    const data = await fetchParcelItems();

    // Sort by quantity ascending (smallest first)
    const sortedData = data
      .filter((item) => item.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity);
    setItems(sortedData);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const timeString = `${timeHour}:${timeMinute} ${timeAMPM}`;
    const newItem = await addParcelItem({
      item_name: name,
      date,
      quantity: Number(quantity),
      time_in: timeString,
    });
    if (!newItem) return;

    await loadItems();
    setName("");
    setDate("");
    setQuantity(1);
    setTimeHour("1");
    setTimeMinute("00");
    setTimeAMPM("AM");
  };

  // Pagination calculations
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
          ? "dark min-h-screen bg-gray-900 text-white"
          : "min-h-screen bg-gray-50 text-black"
      }
    >
      {/* Navbar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b shadow-sm animate__animated animate__fadeInDown animate__faster ${
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
                  darkMode ? "bg-gray-700" : "bg-gray-300"
                }`}
              ></div>
              <div className="flex items-center gap-2 px-3">
                <PackageCheck
                  className={`w-6 h-6 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <h1 className="text-3xl font-bold tracking-wide">Stock In</h1>
              </div>
              <div
                className={`flex-1 h-[2px] ${
                  darkMode ? "bg-gray-700" : "bg-gray-300"
                }`}
              ></div>
            </div>
            <p className="text-center text-sm opacity-70">
              Record new items delivered to your inventory
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleAddItem}
            className={`p-6 rounded-xl shadow-lg mb-8 border transition animate__animated animate__fadeInUp animate__faster ${
              darkMode
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2 mb-6">
              <Plus
                className={`w-5 h-5 ${
                  darkMode ? "text-blue-400" : "text-blue-600"
                }`}
              />
              <h2 className={`text-lg font-semibold`}>Add New Item</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
              {/* Item Name */}
              <div>
                <label
                  className={`text-sm font-medium mb-2 flex items-center gap-1.5 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <Package className="w-4 h-4" /> Item Name
                </label>
                <input
                  type="text"
                  placeholder="Item name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`border rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 transition-all ${
                    darkMode
                      ? "border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400"
                      : "border-gray-300 focus:ring-blue-400 focus:border-blue-400 bg-white text-black placeholder-gray-400"
                  }`}
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label
                  className={`text-sm font-medium mb-2 flex items-center gap-1.5 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
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
                      ? "border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                      : "border-gray-300 focus:ring-blue-400 focus:border-blue-400 bg-white text-black"
                  }`}
                  required
                />
              </div>

              {/* Quantity */}
              <div>
                <label
                  className={`text-sm font-medium mb-2 flex items-center gap-1.5 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
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
                      ? "border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                      : "border-gray-300 focus:ring-blue-400 focus:border-blue-400 bg-white text-black"
                  }`}
                  required
                />
              </div>

              {/* Time In */}
              <div>
                <label
                  className={`text-sm font-medium mb-2 flex items-center gap-1.5 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <Clock className="w-4 h-4" /> Time In
                </label>
                <div className="flex gap-2">
                  <select
                    value={timeHour}
                    onChange={(e) => setTimeHour(e.target.value)}
                    className={`border rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 transition-all ${
                      darkMode
                        ? "border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                        : "border-gray-300 focus:ring-blue-400 focus:border-blue-400 bg-white text-black"
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
                        ? "border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                        : "border-gray-300 focus:ring-blue-400 focus:border-blue-400 bg-white text-black"
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
                        ? "border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                        : "border-gray-300 focus:ring-blue-400 focus:border-blue-400 bg-white text-black"
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" /> Add Item
              </button>
            </div>
          </form>

          {/* Stats */}
          <div
            className={`mb-6 flex justify-between p-4 rounded-lg shadow animate__animated animate__fadeInUp animate__fast ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <div>Total Items: {items.length}</div>
            <div>
              Total Quantity:{" "}
              {items.reduce((sum, item) => sum + Number(item.quantity), 0)}
            </div>
          </div>

          {/* Table */}
          <div
            className={`rounded-xl shadow-xl overflow-hidden border transition animate__animated animate__fadeInUp animate__fast ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead
                  className={`${
                    darkMode
                      ? "bg-gray-700 text-gray-200"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <tr>
                    {["ITEM NAME", "DATE", "QUANTITY", "TIME IN"].map(
                      (head) => (
                        <th
                          key={head}
                          className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap"
                        >
                          {head}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className={`text-center p-8 sm:p-12 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        } animate__animated animate__fadeIn`}
                      >
                        <PackageCheck
                          className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 animate__animated animate__fadeIn`}
                        />
                        <p className="text-base sm:text-lg font-medium mb-1">
                          No items added yet
                        </p>
                        <p className="text-xs sm:text-sm opacity-75">
                          Add your first item using the form above
                        </p>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`border-t transition animate__animated animate__fadeIn animate__faster ${
                          darkMode
                            ? "border-gray-700 hover:bg-gray-700/40"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <td className="p-3 sm:p-4 font-semibold text-sm sm:text-base whitespace-nowrap">
                          {item.name}
                        </td>
                        <td className="p-3 sm:p-4 text-sm sm:text-base whitespace-nowrap">
                          {item.date}
                        </td>
                        <td className="p-3 sm:p-4">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-lg font-bold text-xs sm:text-sm ${
                              darkMode
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-green-100 text-green-700 border border-green-200"
                            }`}
                          >
                            {item.quantity}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-sm sm:text-base whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="sm:w-4 sm:h-4" />{" "}
                            {item.timeIn}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {items.length > 5 && (
              <div
                className={`flex items-center justify-between px-4 py-3 border-t ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, items.length)} of {items.length}{" "}
                    entries
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
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : darkMode
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                            darkMode ? "text-gray-400" : "text-gray-600"
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
                              ? "bg-blue-600 text-white shadow-md"
                              : darkMode
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : darkMode
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
