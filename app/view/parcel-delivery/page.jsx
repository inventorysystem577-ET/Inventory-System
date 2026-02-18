/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useState, useEffect } from "react";
import AuthGuard from "../../components/AuthGuard";
import TopNavbar from "../../components/TopNavbar";
import Sidebar from "../../components/Sidebar";
import { PackageOpen, Plus, Clock, Calendar, Package } from "lucide-react";
import "animate.css";
import {
  fetchParcelOutItems,
  handleAddParcelOut,
} from "../../utils/parcelOutHelper";
import { fetchParcelItems } from "../../utils/parcelShippedHelper";

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("parcel-out");
  const [darkMode, setDarkMode] = useState(false);

  const [items, setItems] = useState([]); // parcel-out items
  const [availableItems, setAvailableItems] = useState([]); // parcel-in items
  const [selectedItemId, setSelectedItemId] = useState(""); // initially empty for "Please select"
  const [date, setDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [timeHour, setTimeHour] = useState("1");
  const [timeMinute, setTimeMinute] = useState("00");
  const [timeAMPM, setTimeAMPM] = useState("AM");

  const [selectedFilter, setSelectedFilter] = useState(""); // for table filter

  // Get selected item details
  const selectedItem = availableItems.find(
    (item) => item.name === selectedItemId,
  );
  const availableStock = selectedItem?.quantity || 0;
  const maxQuantity = availableStock; // ✅ Pwede na i-out lahat hanggang 0
  const canAddParcelOut = availableStock > 0; // ✅ Basta may stock, pwede mag-out

  // Load dark mode and fetch items on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) setDarkMode(savedDarkMode === "true");

    const loadItems = async () => {
      const outItems = await fetchParcelOutItems();
      setItems(outItems);

      const inItems = await fetchParcelItems();
      setAvailableItems(inItems);
    };

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
    loadItems();
  }, []);

  const formatTo12Hour = (time) => {
    if (!time) return "";

    // if may AM/PM na wag na galawin
    if (time.includes("AM") || time.includes("PM")) return time;

    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr);

    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12;

    return `${hour}:${minute} ${ampm}`;
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedItemId) return;

    const result = await handleAddParcelOut({
      item_name: selectedItemId,
      date,
      quantity: Number(quantity),
      timeHour,
      timeMinute,
      timeAMPM,
    });

    if (!result || !result.newItem) return;

    // Update UI from returned lists
    setItems(result.updatedOut || []);
    setAvailableItems(result.updatedIn || []);

    alert(
      `✅ Successfully created Parcel Out!\n` +
        `Item: ${selectedItemId}\n` +
        `Quantity Out: ${quantity} units`,
    );

    // Reset form
    setSelectedItemId("");
    setDate("");
    setQuantity(1);
    setTimeHour("1");
    setTimeMinute("00");
    setTimeAMPM("AM");
  };

  return (
    <AuthGuard darkMode={darkMode}>
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
                      darkMode ? "text-[#F97316]" : "text-[#EA580C]"
                    }`}
                  />
                  <h1 className="text-3xl font-bold tracking-wide">
                    Stock Out
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
                Record items going out of your inventory
              </p>
            </div>

            {/* Add Item Form */}
            <form
              onSubmit={handleAddItem}
              className={`p-6 rounded-xl shadow-lg mb-8 border animate__animated animate__fadeInUp ${
                darkMode
                  ? "bg-[#1F2937] border-[#374151]"
                  : "bg-white border-[#E5E7EB]"
              }`}
            >
              <div className="flex items-center gap-2 mb-5">
                <Plus
                  className={`w-5 h-5 ${darkMode ? "text-[#F97316]" : "text-[#EA580C]"}`}
                />
                <h2
                  className={`text-lg font-semibold ${
                    darkMode ? "text-white" : "text-[#111827]"
                  }`}
                >
                  Out Item
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Item Name Dropdown */}
                <div className="flex flex-col">
                  <label
                    className={`text-sm font-medium mb-2 flex items-center gap-1.5 ${
                      darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                    }`}
                  >
                    <Package className="w-4 h-4" /> Item Name
                  </label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => {
                      setSelectedItemId(e.target.value);
                      setQuantity(1); // Reset quantity when item changes
                    }}
                    className={`border rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 transition-all ${
                      darkMode
                        ? "border-[#374151] focus:ring-[#F97316] focus:border-[#F97316] bg-[#111827] text-white"
                        : "border-[#D1D5DB] focus:ring-[#EA580C] focus:border-[#EA580C] bg-white text-black"
                    }`}
                    required
                  >
                    <option value="" disabled>
                      Please select
                    </option>
                    {availableItems.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name} (Stock: {item.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="flex flex-col">
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
                    className={`border rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 transition-all ${
                      darkMode
                        ? "border-[#374151] focus:ring-[#F97316] focus:border-[#F97316] bg-[#111827] text-white"
                        : "border-[#D1D5DB] focus:ring-[#EA580C] focus:border-[#EA580C] bg-white text-black"
                    }`}
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="flex flex-col">
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
                    max={maxQuantity || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={!selectedItemId || !canAddParcelOut}
                    className={`border rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 transition-all ${
                      darkMode
                        ? "border-[#374151] focus:ring-[#F97316] focus:border-[#F97316] bg-[#111827] text-white disabled:bg-[#0B0B0B] disabled:opacity-50 disabled:cursor-not-allowed"
                        : "border-[#D1D5DB] focus:ring-[#EA580C] focus:border-[#EA580C] bg-white text-black disabled:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                    required
                  />
                  {selectedItemId && !canAddParcelOut && (
                    <p className="text-xs text-[#EF4444] mt-1">
                      ⚠️ No stock available
                    </p>
                  )}
                  {selectedItemId && canAddParcelOut && (
                    <p
                      className={`text-xs mt-1 ${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}
                    >
                      Available: {availableStock} units (can take out 1-
                      {maxQuantity})
                    </p>
                  )}
                </div>

                {/* Time Out */}
                <div className="flex flex-col">
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
                      className={`border rounded-lg px-2 py-2.5 w-full focus:outline-none focus:ring-2 transition-all ${
                        darkMode
                          ? "border-[#374151] focus:ring-[#F97316] focus:border-[#F97316] bg-[#111827] text-white"
                          : "border-[#D1D5DB] focus:ring-[#EA580C] focus:border-[#EA580C] bg-white text-black"
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
                      className={`border rounded-lg px-2 py-2.5 w-full focus:outline-none focus:ring-2 transition-all ${
                        darkMode
                          ? "border-[#374151] focus:ring-[#F97316] focus:border-[#F97316] bg-[#111827] text-white"
                          : "border-[#D1D5DB] focus:ring-[#EA580C] focus:border-[#EA580C] bg-white text-black"
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
                      className={`border rounded-lg px-2 py-2.5 w-full focus:outline-none focus:ring-2 transition-all ${
                        darkMode
                          ? "border-[#374151] focus:ring-[#F97316] focus:border-[#F97316] bg-[#111827] text-white"
                          : "border-[#D1D5DB] focus:ring-[#EA580C] focus:border-[#EA580C] bg-white text-black"
                      }`}
                    >
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={!canAddParcelOut}
                  className={`bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg ${
                    canAddParcelOut
                      ? "animate__animated animate__pulse animate__infinite animate__slow"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <Plus className="w-5 h-5" /> Out Item
                </button>
              </div>
            </form>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2 mb-4">
              <label
                className={`text-sm font-medium ${
                  darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                }`}
              >
                Filter by Item:
              </label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className={`border rounded-lg px-3 py-2 w-60 focus:outline-none focus:ring-2 transition-all ${
                  darkMode
                    ? "border-[#374151] focus:ring-[#F97316] focus:border-[#F97316] bg-[#111827] text-white"
                    : "border-[#D1D5DB] focus:ring-[#EA580C] focus:border-[#EA580C] bg-white text-black"
                }`}
              >
                <option value="">All Items</option>
                {availableItems.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Items Table */}
            <div
              className={`rounded-xl shadow-lg overflow-x-auto overflow-y-auto border animate__animated animate__fadeInRight max-h-[600px] ${
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
                    {["Item Name", "Date", "Quantity", "Time Out"].map(
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
                  {(selectedFilter
                    ? items.filter((item) => item.name === selectedFilter)
                    : items
                  ).length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className={`px-4 sm:px-6 py-12 sm:py-16 text-center ${
                          darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
                        }`}
                      >
                        <PackageOpen
                          className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 animate__animated animate__bounce animate__infinite animate__slow ${
                            darkMode ? "text-[#6B7280]" : "text-[#D1D5DB]"
                          }`}
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
                    (selectedFilter
                      ? items.filter((item) => item.name === selectedFilter)
                      : items
                    ).map((item, index) => (
                      <tr
                        key={item.id}
                        className={`transition-all duration-200 animate__animated animate__fadeInUp ${
                          darkMode
                            ? "hover:bg-[#374151]/40"
                            : "hover:bg-[#F3F4F6]"
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td
                          className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap font-semibold text-sm sm:text-base ${
                            darkMode ? "text-[#FFFFFF]" : "text-[#111827]"
                          }`}
                        >
                          {item.name}
                        </td>
                        <td
                          className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base ${
                            darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                          }`}
                        >
                          {item.date}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold ${
                              darkMode
                                ? "bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30"
                                : "bg-[#FFEDD5] text-[#EA580C] border border-[#FED7AA]"
                            }`}
                          >
                            {item.quantity} units
                          </span>
                        </td>
                        <td
                          className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base ${
                            darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-50" />
                            {formatTo12Hour(item.timeOut)}
                          </div>
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
    </AuthGuard>
  );
}
