/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import TopNavbar from "../../components/TopNavbar";
import AuthGuard from "../../components/AuthGuard";
import StockHistoryModal from "../../components/StockHistoryModal";
import StockThresholdModal from "../../components/StockThresholdModal";
import StatusSummaryCards from "../../components/StatusSummaryCards";
import InventoryFilterRow from "../../components/InventoryFilterRow";
import InventoryTable from "../../components/InventoryTable";
import ExportModal from "../../components/ExportModal";
import ImportModal from "../../components/ImportModal";
import {
  Box,
  AlertTriangle,
  TrendingDown,
  XCircle,
  Package,
  FileText,
  FileSpreadsheet,
  FileJson,
  FileDown,
  ChevronDown,
  Upload,
} from "lucide-react";
import "animate.css";

import { useAuth } from "../../hook/useAuth";
import { useInventoryData } from "../../hook/useInventoryData";
import { useStockThresholds } from "../../hook/useStockThresholds";
import { useInventoryFilters } from "../../hook/useInventoryFilters";
import { useDescriptionEdit } from "../../hook/useDescriptionEdit";
import { useImportExport } from "../../hook/useImportExport";
import { isAdminRole, isStaffRole } from "../../utils/roleHelper";
import {
  buildDescription,
  buildProductCode,
  buildSku,
} from "../../utils/inventoryMeta";
import {
  CATEGORIES,
  CATEGORY_OPTIONS,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_OPTIONS,
  getCategoryColor,
  getCategoryIcon,
} from "../../utils/categoryUtils";
import {
  DEFAULT_STOCK_THRESHOLDS,
  getStockStatus,
  getStatusLabel,
  getStatusColor,
  getIndicatorColor,
} from "../../utils/stockStatus";
import { truncateText } from "../../utils/textHelpers";

export default function Page() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const typeParam = searchParams.get("type");
  const focusParam = searchParams.get("focus");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("product-inventory");
  const [darkMode, setDarkMode] = useState(false);

  const { role } = useAuth();
  const isAdmin = isAdminRole(role);
  const canViewHistory = isAdmin || isStaffRole(role);
  const {
    parcelItems,
    productItems,
    parcelOutItems,
    productOutItems,
    loadItems,
    setProductItems,
    isUpdatingCategoryId,
    categoryTransferError,
    transferCategory,
    showHistoryModal,
    historyTarget,
    setTimeframePreview,
    openHistoryModal,
    closeHistoryModal,
    getDisplayedQuantity,
  } = useInventoryData();
  const {
    showThresholdModal,
    thresholdTarget,
    openThresholdModal,
    closeThresholdModal,
    saveThresholdForTarget,
    resetThresholdForTarget,
    getItemThreshold,
  } = useStockThresholds();

  const DESCRIPTION_TRUNCATE_LIMIT = 140;

  const parcelTableRef = useRef(null);
  const productTableRef = useRef(null);

  const {
    filterParcelStatus,
    setFilterParcelStatus,
    filterProductStatus,
    setFilterProductStatus,
    parcelSearch,
    setParcelSearch,
    productSearch,
    setProductSearch,
    parcelCategoryFilter,
    setParcelCategoryFilter,
    productCategoryFilter,
    setProductCategoryFilter,
    parcelSortOrder,
    setParcelSortOrder,
    productSortOrder,
    setProductSortOrder,
    parcelCurrentPage,
    setParcelCurrentPage,
    productCurrentPage,
    setProductCurrentPage,
    sortedParcelItems,
    sortedProductItems,
    parcelTotalPages,
    productTotalPages,
    parcelIndexOfFirstItem,
    parcelIndexOfLastItem,
    productIndexOfFirstItem,
    productIndexOfLastItem,
    paginatedParcelItems,
    paginatedProductItems,
    parcelStatusCounts,
    productStatusCounts,
    focusedSection,
  } = useInventoryFilters({
    parcelItems,
    productItems,
    getItemThreshold,
    statusParam,
    typeParam,
    focusParam,
    parcelTableRef,
    productTableRef,
  });

  const {
    descriptionUpdateError,
    expandedDescriptionIds,
    editingDescriptionId,
    editingDescriptionValue,
    setEditingDescriptionValue,
    isSavingDescription,
    toggleDescriptionExpanded,
    startEditingDescription,
    cancelEditingDescription,
    saveEditingDescription,
  } = useDescriptionEdit({ setProductItems });

  const {
    showImportModal,
    setShowImportModal,
    importPreview,
    setImportFile,
    importLoading,
    importResult,
    setImportResult,
    showExportModal,
    setShowExportModal,
    exportError,
    handleImportFile,
    confirmImport,
    handleExportClick,
    handleExport,
  } = useImportExport({
    isAdmin,
    parcelItems,
    productItems,
    loadItems,
  });

  const getStatusIcon = (quantity, threshold = DEFAULT_STOCK_THRESHOLDS) => {
    const status = getStockStatus(quantity, threshold);
    if (status === "out") return <XCircle className="w-4 h-4" />;
    if (status === "critical")
      return <AlertTriangle className="w-4 h-4 animate-pulse" />;
    if (status === "low") return <TrendingDown className="w-4 h-4" />;
    return <Box className="w-4 h-4" />;
  };


  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) setDarkMode(savedDarkMode === "true");
  }, []);

  const exportOptions = [
    {
      format: "pdf",
      label: "PDF Document",
      description: "Formatted report with tables",
      icon: <FileText className="w-5 h-5" />,
      color: "text-red-500",
      bg: darkMode ? "hover:bg-red-500/10" : "hover:bg-red-50",
      border: "hover:border-red-300",
    },
    {
      format: "excel",
      label: "Excel Spreadsheet",
      description: "Two sheets: Components & Products",
      icon: <FileSpreadsheet className="w-5 h-5" />,
      color: "text-green-500",
      bg: darkMode ? "hover:bg-green-500/10" : "hover:bg-green-50",
      border: "hover:border-green-300",
    },
    {
      format: "csv",
      label: "CSV File",
      description: "Comma-separated values",
      icon: <FileDown className="w-5 h-5" />,
      color: "text-blue-500",
      bg: darkMode ? "hover:bg-blue-500/10" : "hover:bg-blue-50",
      border: "hover:border-blue-300",
    },
    {
      format: "json",
      label: "JSON File",
      description: "Raw structured data",
      icon: <FileJson className="w-5 h-5" />,
      color: "text-yellow-500",
      bg: darkMode ? "hover:bg-yellow-500/10" : "hover:bg-yellow-50",
      border: "hover:border-yellow-300",
    },
    {
      format: "word",
      label: "Word Document",
      description: "Formatted .doc file",
      icon: <FileText className="w-5 h-5" />,
      color: "text-indigo-500",
      bg: darkMode ? "hover:bg-indigo-500/10" : "hover:bg-indigo-50",
      border: "hover:border-indigo-300",
    },
  ];

  const sharedTableHandlers = {
    isAdmin,
    canViewHistory,
    openHistoryModal,
    openThresholdModal,
    transferCategory,
    isUpdatingCategoryId,
    getDisplayedQuantity,
    getItemThreshold,
    getIndicatorColor,
    getStatusColor,
    getStatusIcon,
    getStatusLabel,
    getCategoryColor,
    getCategoryIcon,
    buildSku,
    buildDescription,
    truncateText,
    descriptionLimit: DESCRIPTION_TRUNCATE_LIMIT,
    expandedDescriptionIds,
    toggleDescriptionExpanded,
    editingDescriptionId,
    editingDescriptionValue,
    setEditingDescriptionValue,
    isSavingDescription,
    saveEditingDescription,
    cancelEditingDescription,
    startEditingDescription,
  };

  const parcelTableConfig = {
    kind: "parcel",
    focusedSection,
    ringClass: "ring-[#1e40af]",
    lightHeaderClass: "bg-[#1e40af]",
    emptyIcon: Package,
    emptyLabel: "parcels",
    categoryOptions: CATEGORY_OPTIONS,
    defaultCategory: CATEGORIES.OTHERS,
    pageActiveClass: "bg-[#1E40AF]",
    getDisplayName: (item) => item.name,
    getCode: (item) => buildProductCode(item, "CMP"),
    getAddStockHref: (item) =>
      `/view/parcel-shipped?item=${encodeURIComponent(item.name)}`,
  };

  const productTableConfig = {
    kind: "product",
    focusedSection,
    ringClass: "ring-[#7c3aed]",
    lightHeaderClass: "bg-[#7c3aed]",
    emptyIcon: Box,
    emptyLabel: "products",
    categoryOptions: PRODUCT_CATEGORY_OPTIONS,
    defaultCategory: PRODUCT_CATEGORIES.OTHER,
    pageActiveClass: "bg-[#6D28D9]",
    getDisplayName: (item) => item.product_name,
    getCode: (item) => buildProductCode(item),
    getAddStockHref: (item) =>
      `/view/product-in?product=${encodeURIComponent(item.product_name)}`,
  };

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
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
        />

        <div
          className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "ml-0"} pt-16`}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Page Header */}
            <div className="flex flex-col items-center text-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  Inventory Status
                </h1>
                <p
                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Monitor stock levels for components and products
                </p>
              </div>

              {/* Export + Import Buttons */}
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <button
                  onClick={handleExportClick}
                  disabled={!isAdmin}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isAdmin
                      ? "bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white hover:shadow-xl hover:scale-105 active:scale-95"
                      : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
                >
                  <FileDown className="w-4 h-4" />
                  Export Inventory
                  <ChevronDown className="w-4 h-4" />
                </button>

                <label className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-[#0f766e] to-[#0d9488] text-white hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import Excel
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(e) => handleImportFile(e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            {/* Alert Banner */}
            {(parcelStatusCounts.out > 0 ||
              parcelStatusCounts.critical > 0 ||
              productStatusCounts.out > 0 ||
              productStatusCounts.critical > 0) && (
              <div
                className={`p-4 rounded-xl mb-6 border-l-4 animate__animated animate__fadeInDown ${darkMode ? "bg-[#7f1d1d]/20 border-[#EF4444]" : "bg-[#FEE2E2] border-[#DC2626]"}`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-[#EF4444] mb-1">
                      Inventory Alert
                    </h3>
                    <p
                      className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {parcelStatusCounts.out > 0 && (
                        <>
                          <strong>Components:</strong> {parcelStatusCounts.out}{" "}
                          item{parcelStatusCounts.out > 1 ? "s" : ""} out of
                          stock
                        </>
                      )}
                      {parcelStatusCounts.out > 0 &&
                        parcelStatusCounts.critical > 0 &&
                        " • "}
                      {parcelStatusCounts.critical > 0 && (
                        <>
                          {parcelStatusCounts.critical} item
                          {parcelStatusCounts.critical > 1 ? "s" : ""} at
                          critical level
                        </>
                      )}
                      {(parcelStatusCounts.out > 0 ||
                        parcelStatusCounts.critical > 0) &&
                        (productStatusCounts.out > 0 ||
                          productStatusCounts.critical > 0) && (
                          <span className="mx-2">|</span>
                        )}
                      {productStatusCounts.out > 0 && (
                        <>
                          <strong>Products:</strong> {productStatusCounts.out}{" "}
                          product{productStatusCounts.out > 1 ? "s" : ""} out of
                          stock
                        </>
                      )}
                      {productStatusCounts.out > 0 &&
                        productStatusCounts.critical > 0 &&
                        " • "}
                      {productStatusCounts.critical > 0 && (
                        <>
                          {productStatusCounts.critical} product
                          {productStatusCounts.critical > 1 ? "s" : ""} at
                          critical level
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {categoryTransferError && (
              <div
                className={`p-3 rounded-xl mb-6 border animate__animated animate__fadeInDown ${
                  darkMode
                    ? "bg-red-900/20 border-red-800 text-red-300"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {categoryTransferError}
              </div>
            )}

            {descriptionUpdateError && (
              <div
                className={`p-3 rounded-xl mb-6 border animate__animated animate__fadeInDown ${
                  darkMode
                    ? "bg-red-900/20 border-red-800 text-red-300"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {descriptionUpdateError}
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-6 h-6 text-[#1e40af]" />
                <h2 className="text-xl font-bold">Stock Status</h2>
              </div>

              <StatusSummaryCards
                darkMode={darkMode}
                counts={parcelStatusCounts}
                activeStatus={filterParcelStatus}
                onSelectStatus={setFilterParcelStatus}
                animationStart={0.1}
              />

              <InventoryFilterRow
                darkMode={darkMode}
                lightFocusClass="focus:ring-[#1e40af] focus:border-[#1e40af]"
                filters={{
                  statusValue: filterParcelStatus,
                  onStatusChange: setFilterParcelStatus,
                  totalCount: parcelItems.length,
                  statusCounts: parcelStatusCounts,
                  categoryValue: parcelCategoryFilter,
                  onCategoryChange: setParcelCategoryFilter,
                  categoryOptions: CATEGORY_OPTIONS,
                  searchValue: parcelSearch,
                  onSearchChange: setParcelSearch,
                  sortValue: parcelSortOrder,
                  onSortChange: setParcelSortOrder,
                }}
              />

              <InventoryTable
                darkMode={darkMode}
                tableRef={parcelTableRef}
                config={parcelTableConfig}
                state={{
                  items: parcelItems,
                  sortedItems: sortedParcelItems,
                  paginatedItems: paginatedParcelItems,
                  currentPage: parcelCurrentPage,
                  totalPages: parcelTotalPages,
                  indexOfFirstItem: parcelIndexOfFirstItem,
                  indexOfLastItem: parcelIndexOfLastItem,
                  setCurrentPage: setParcelCurrentPage,
                }}
                handlers={sharedTableHandlers}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Box className="w-6 h-6 text-[#7c3aed]" />
                <h2 className="text-xl font-bold">EROVOUTIKA Product Status</h2>
              </div>

              <StatusSummaryCards
                darkMode={darkMode}
                counts={productStatusCounts}
                activeStatus={filterProductStatus}
                onSelectStatus={setFilterProductStatus}
                animationStart={0.5}
              />

              <InventoryFilterRow
                darkMode={darkMode}
                lightFocusClass="focus:ring-[#7c3aed] focus:border-[#7c3aed]"
                filters={{
                  statusValue: filterProductStatus,
                  onStatusChange: setFilterProductStatus,
                  totalCount: productItems.length,
                  statusCounts: productStatusCounts,
                  categoryValue: productCategoryFilter,
                  onCategoryChange: setProductCategoryFilter,
                  categoryOptions: PRODUCT_CATEGORY_OPTIONS,
                  searchValue: productSearch,
                  onSearchChange: setProductSearch,
                  sortValue: productSortOrder,
                  onSortChange: setProductSortOrder,
                }}
              />

              <InventoryTable
                darkMode={darkMode}
                tableRef={productTableRef}
                config={productTableConfig}
                state={{
                  items: productItems,
                  sortedItems: sortedProductItems,
                  paginatedItems: paginatedProductItems,
                  currentPage: productCurrentPage,
                  totalPages: productTotalPages,
                  indexOfFirstItem: productIndexOfFirstItem,
                  indexOfLastItem: productIndexOfLastItem,
                  setCurrentPage: setProductCurrentPage,
                }}
                handlers={sharedTableHandlers}
              />
            </div>
          </div>
        </div>

        <StockHistoryModal
          open={showHistoryModal && Boolean(historyTarget)}
          darkMode={darkMode}
          historyTarget={historyTarget}
          parcelItems={parcelItems}
          parcelOutItems={parcelOutItems}
          productItems={productItems}
          productOutItems={productOutItems}
          onClose={closeHistoryModal}
          onPreviewChange={setTimeframePreview}
        />

        <StockThresholdModal
          open={showThresholdModal && Boolean(thresholdTarget)}
          darkMode={darkMode}
          thresholdTarget={thresholdTarget}
          defaultThresholds={DEFAULT_STOCK_THRESHOLDS}
          currentThreshold={
            thresholdTarget
              ? getItemThreshold(thresholdTarget.type, thresholdTarget.item)
              : DEFAULT_STOCK_THRESHOLDS
          }
          onClose={closeThresholdModal}
          onSave={saveThresholdForTarget}
          onReset={resetThresholdForTarget}
        />

        <ExportModal
          open={showExportModal}
          darkMode={darkMode}
          options={exportOptions}
          exportError={exportError}
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
        />

        <ImportModal
          open={showImportModal}
          darkMode={darkMode}
          importPreview={importPreview}
          importResult={importResult}
          importLoading={importLoading}
          onConfirm={confirmImport}
          onCancel={() => {
            setShowImportModal(false);
            setImportFile(null);
            setImportResult(null);
          }}
          buildProductCode={buildProductCode}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
        />
      </div>
    </AuthGuard>
  );
}
