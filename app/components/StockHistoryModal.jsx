"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import ActionModal from "./ActionModal";

const normalizeKey = (value) =>
  (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const toIsoDate = (value) => {
  const dateValue = (value || "").toString().trim();
  if (!dateValue) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().split("T")[0];
};

const toNumber = (value) => Number(value || 0);

export default function StockHistoryModal({
  open,
  darkMode,
  historyTarget,
  parcelItems = [],
  parcelOutItems = [],
  productItems = [],
  productOutItems = [],
  onClose,
  onPreviewChange,
}) {
  const [historyFilterMode, setHistoryFilterMode] = useState("month");
  const [historyMonth, setHistoryMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [historyDate, setHistoryDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    if (!open || !historyTarget) return;
    setHistoryFilterMode("month");
    setHistoryMonth(new Date().toISOString().slice(0, 7));
    setHistoryDate(new Date().toISOString().split("T")[0]);
  }, [open, historyTarget]);

  const historyEntries = useMemo(() => {
    if (!historyTarget?.item) return [];

    const isParcel = historyTarget.type === "parcel";
    const itemKey = normalizeKey(
      isParcel ? historyTarget.item.name : historyTarget.item.product_name,
    );

    const inRows = isParcel ? parcelItems : productItems;
    const outRows = isParcel ? parcelOutItems : productOutItems;

    const inEntries = inRows
      .filter(
        (row) =>
          normalizeKey(isParcel ? row.name : row.product_name) === itemKey,
      )
      .map((row) => ({
        id: `in-${row.id}-${toIsoDate(row.date)}`,
        date: toIsoDate(row.date),
        type: "in",
        quantity: toNumber(row.quantity),
        source: "Stock In",
      }))
      .filter((entry) => entry.date);

    const outEntries = outRows
      .filter(
        (row) =>
          normalizeKey(isParcel ? row.name : row.product_name) === itemKey,
      )
      .map((row) => ({
        id: `out-${row.id}-${toIsoDate(row.date)}`,
        date: toIsoDate(row.date),
        type: "out",
        quantity: toNumber(row.quantity),
        source: "Stock Out",
      }))
      .filter((entry) => entry.date);

    return [...inEntries, ...outEntries].sort((a, b) =>
      a.date === b.date ? (a.type === "in" ? -1 : 1) : a.date.localeCompare(b.date),
    );
  }, [historyTarget, parcelItems, parcelOutItems, productItems, productOutItems]);

  const selectedRange = useMemo(() => {
    if (historyFilterMode === "date") {
      const iso = toIsoDate(historyDate);
      if (!iso) return { start: "", end: "" };
      return { start: iso, end: iso };
    }

    const month = (historyMonth || "").trim();
    if (!/^\d{4}-\d{2}$/.test(month)) return { start: "", end: "" };
    const [y, m] = month.split("-").map(Number);
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0);
    return {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    };
  }, [historyFilterMode, historyMonth, historyDate]);

  const filteredHistoryEntries = useMemo(
    () =>
      historyEntries.filter(
        (entry) =>
          selectedRange.start &&
          selectedRange.end &&
          entry.date >= selectedRange.start &&
          entry.date <= selectedRange.end,
      ),
    [historyEntries, selectedRange],
  );

  const stockAtRangeEnd = useMemo(
    () =>
      historyEntries.reduce((sum, entry) => {
        if (!selectedRange.end || entry.date > selectedRange.end) return sum;
        return entry.type === "in" ? sum + entry.quantity : sum - entry.quantity;
      }, 0),
    [historyEntries, selectedRange.end],
  );

  const totalInRange = useMemo(
    () =>
      filteredHistoryEntries
        .filter((entry) => entry.type === "in")
        .reduce((sum, entry) => sum + entry.quantity, 0),
    [filteredHistoryEntries],
  );

  const totalOutRange = useMemo(
    () =>
      filteredHistoryEntries
        .filter((entry) => entry.type === "out")
        .reduce((sum, entry) => sum + entry.quantity, 0),
    [filteredHistoryEntries],
  );

  const netInRange = totalInRange - totalOutRange;

  const monthRows = useMemo(() => {
    const monthlySummary = historyEntries.reduce((acc, entry) => {
      const monthKey = entry.date.slice(0, 7);
      const current =
        acc.get(monthKey) || { month: monthKey, inQty: 0, outQty: 0, endStock: 0 };
      if (entry.type === "in") current.inQty += entry.quantity;
      else current.outQty += entry.quantity;
      acc.set(monthKey, current);
      return acc;
    }, new Map());

    return Array.from(monthlySummary.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((row) => ({
        ...row,
        endStock: historyEntries.reduce((sum, entry) => {
          if (entry.date.slice(0, 7) > row.month) return sum;
          return entry.type === "in" ? sum + entry.quantity : sum - entry.quantity;
        }, 0),
      }));
  }, [historyEntries]);

  useEffect(() => {
    if (!onPreviewChange) return;

    if (!open || !historyTarget || !selectedRange.end) {
      onPreviewChange(null);
      return;
    }

    onPreviewChange({
      type: historyTarget.type,
      id: historyTarget.item?.id,
      quantity: Math.max(stockAtRangeEnd, 0),
    });
  }, [
    onPreviewChange,
    open,
    historyTarget,
    selectedRange.end,
    stockAtRangeEnd,
  ]);

  if (!open || !historyTarget) return null;

  const itemName =
    historyTarget.type === "parcel"
      ? historyTarget.item.name
      : historyTarget.item.product_name;

  return (
    <ActionModal
      open={open}
      darkMode={darkMode}
      title="Stock History Viewer"
      subtitle={`${historyTarget.type === "parcel" ? "Component" : "Product"}: ${itemName}`}
      onClose={onClose}
      icon={<Search className="w-5 h-5 text-blue-500" />}
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              darkMode
                ? "bg-[#374151] hover:bg-[#4B5563] text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            Close
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label
            className={`block text-xs font-medium mb-2 ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Filter Type
          </label>
          <select
            value={historyFilterMode}
            onChange={(e) => setHistoryFilterMode(e.target.value)}
            className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 transition-all text-sm ${
              darkMode
                ? "border-[#374151] focus:ring-[#60A5FA] focus:border-[#60A5FA] bg-[#111827] text-white"
                : "border-[#D1D5DB] focus:ring-[#1D4ED8] focus:border-[#1D4ED8] bg-white text-black"
            }`}
          >
            <option value="month">Month</option>
            <option value="date">Exact Date</option>
          </select>
        </div>
        <div>
          <label
            className={`block text-xs font-medium mb-2 ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {historyFilterMode === "month" ? "Select Month" : "Select Date"}
          </label>
          {historyFilterMode === "month" ? (
            <input
              type="month"
              value={historyMonth}
              onChange={(e) => setHistoryMonth(e.target.value)}
              className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 transition-all text-sm ${
                darkMode
                  ? "border-[#374151] focus:ring-[#60A5FA] focus:border-[#60A5FA] bg-[#111827] text-white"
                  : "border-[#D1D5DB] focus:ring-[#1D4ED8] focus:border-[#1D4ED8] bg-white text-black"
              }`}
            />
          ) : (
            <input
              type="date"
              value={historyDate}
              onChange={(e) => setHistoryDate(e.target.value)}
              className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 transition-all text-sm ${
                darkMode
                  ? "border-[#374151] focus:ring-[#60A5FA] focus:border-[#60A5FA] bg-[#111827] text-white"
                  : "border-[#D1D5DB] focus:ring-[#1D4ED8] focus:border-[#1D4ED8] bg-white text-black"
              }`}
            />
          )}
        </div>
        <div
          className={`rounded-xl border px-3 py-2 ${
            darkMode
              ? "border-[#374151] bg-[#111827]"
              : "border-[#E5E7EB] bg-[#F8FAFC]"
          }`}
        >
          <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Active Timeframe
          </p>
          <p className="text-sm font-semibold mt-1">
            {selectedRange.start && selectedRange.end
              ? `${selectedRange.start} to ${selectedRange.end}`
              : "No timeframe selected"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div
          className={`p-3 rounded-xl border ${
            darkMode
              ? "border-[#0F766E] bg-[#0F766E]/10"
              : "border-[#99F6E4] bg-[#F0FDFA]"
          }`}
        >
          <p className="text-xs text-teal-500 font-medium">Stock In</p>
          <p className="text-xl font-bold">{totalInRange} units</p>
        </div>
        <div
          className={`p-3 rounded-xl border ${
            darkMode
              ? "border-[#991B1B] bg-[#991B1B]/10"
              : "border-[#FECACA] bg-[#FEF2F2]"
          }`}
        >
          <p className="text-xs text-red-500 font-medium">Stock Out</p>
          <p className="text-xl font-bold">{totalOutRange} units</p>
        </div>
        <div
          className={`p-3 rounded-xl border ${
            darkMode
              ? "border-[#374151] bg-[#111827]"
              : "border-[#E5E7EB] bg-[#F9FAFB]"
          }`}
        >
          <p
            className={`text-xs font-medium ${
              netInRange >= 0 ? "text-green-500" : "text-orange-500"
            }`}
          >
            Net Change
          </p>
          <p className="text-xl font-bold">{netInRange} units</p>
        </div>
        <div
          className={`p-3 rounded-xl border ${
            darkMode
              ? "border-[#1D4ED8] bg-[#1D4ED8]/10"
              : "border-[#BFDBFE] bg-[#EFF6FF]"
          }`}
        >
          <p className="text-xs text-blue-500 font-medium">Stock at Period End</p>
          <p className="text-xl font-bold">{Math.max(stockAtRangeEnd, 0)} units</p>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-sm font-semibold mb-2">Movement Records</p>
        <div
          className={`rounded-xl border overflow-hidden ${
            darkMode ? "border-[#374151]" : "border-[#E5E7EB]"
          }`}
        >
          <table className="w-full text-xs sm:text-sm">
            <thead
              className={
                darkMode
                  ? "bg-[#374151] text-gray-300"
                  : "bg-[#1E3A8A] text-white"
              }
            >
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Quantity</th>
                <th className="px-3 py-2 text-left">Source</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                darkMode ? "divide-[#374151]" : "divide-[#E5E7EB]"
              }`}
            >
              {filteredHistoryEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className={`px-3 py-5 text-center ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    No movement records in selected timeframe.
                  </td>
                </tr>
              ) : (
                filteredHistoryEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-3 py-2">{entry.date}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          entry.type === "in"
                            ? darkMode
                              ? "bg-teal-500/20 text-teal-300"
                              : "bg-teal-100 text-teal-700"
                            : darkMode
                              ? "bg-red-500/20 text-red-300"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {entry.type === "in" ? "Stock In" : "Stock Out"}
                      </span>
                    </td>
                    <td className="px-3 py-2">{entry.quantity} units</td>
                    <td className="px-3 py-2">{entry.source}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-1">
        <p className="text-sm font-semibold mb-2">Monthly Summary</p>
        <div
          className={`rounded-xl border overflow-hidden ${
            darkMode ? "border-[#374151]" : "border-[#E5E7EB]"
          }`}
        >
          <table className="w-full text-xs sm:text-sm">
            <thead
              className={
                darkMode
                  ? "bg-[#374151] text-gray-300"
                  : "bg-[#4C1D95] text-white"
              }
            >
              <tr>
                <th className="px-3 py-2 text-left">Month</th>
                <th className="px-3 py-2 text-left">Stock In</th>
                <th className="px-3 py-2 text-left">Stock Out</th>
                <th className="px-3 py-2 text-left">End Stock</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                darkMode ? "divide-[#374151]" : "divide-[#E5E7EB]"
              }`}
            >
              {monthRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className={`px-3 py-5 text-center ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    No monthly records available.
                  </td>
                </tr>
              ) : (
                monthRows.map((row) => (
                  <tr key={row.month}>
                    <td className="px-3 py-2">{row.month}</td>
                    <td className="px-3 py-2">{row.inQty} units</td>
                    <td className="px-3 py-2">{row.outQty} units</td>
                    <td className="px-3 py-2">{Math.max(row.endStock, 0)} units</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ActionModal>
  );
}
