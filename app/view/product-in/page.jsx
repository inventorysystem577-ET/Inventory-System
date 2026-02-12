/* eslint-disable react-hooks/purity */
"use client";
import { useState, useEffect } from "react";
import { Package, Search, Plus, Edit2, Trash2, X } from "lucide-react";

export default function ProductIn({ darkMode }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    quantity: "",
    supplier: "",
    dateReceived: "",
    batchNumber: "",
    notes: "",
  });

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockProducts = [
      {
        id: 1,
        productName: "Widget A",
        category: "Electronics",
        quantity: 100,
        supplier: "Supplier Inc.",
        dateReceived: "2024-02-10",
        batchNumber: "BATCH-001",
        notes: "Good condition",
      },
      {
        id: 2,
        productName: "Component B",
        category: "Hardware",
        quantity: 250,
        supplier: "Tech Supplies Co.",
        dateReceived: "2024-02-11",
        batchNumber: "BATCH-002",
        notes: "Urgent delivery",
      },
    ];
    setProducts(mockProducts);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      // Update existing product
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...formData, id: editingProduct.id }
            : p,
        ),
      );
    } else {
      // Add new product
      const newProduct = {
        ...formData,
        id: Date.now(),
        quantity: parseInt(formData.quantity),
      };
      setProducts((prev) => [newProduct, ...prev]);
    }
    handleCloseModal();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      productName: "",
      category: "",
      quantity: "",
      supplier: "",
      dateReceived: "",
      batchNumber: "",
      notes: "",
    });
  };

  const filteredProducts = products.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-bold ${
              darkMode ? "text-white" : "text-[#111827]"
            }`}
          >
            Product In
          </h1>
          <p
            className={`mt-1 ${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}
          >
            Track incoming stock and inventory
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E40AF] transition-all shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Product In</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
            }`}
          />
          <input
            type="text"
            placeholder="Search by product name, category, supplier, or batch number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${
              darkMode
                ? "bg-[#1F2937] border-[#374151] text-white placeholder-[#9CA3AF]"
                : "bg-white border-[#E5E7EB] text-[#111827] placeholder-[#9CA3AF]"
            } focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]`}
          />
        </div>
      </div>

      {/* Products Table */}
      <div
        className={`rounded-lg shadow-lg overflow-hidden ${
          darkMode ? "bg-[#1F2937]" : "bg-white"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              className={
                darkMode
                  ? "bg-[#111827]"
                  : "bg-[#F9FAFB] border-b border-[#E5E7EB]"
              }
            >
              <tr>
                <th
                  className={`px-4 py-4 text-left text-sm font-semibold ${
                    darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                  }`}
                >
                  Product Name
                </th>
                <th
                  className={`px-4 py-4 text-left text-sm font-semibold ${
                    darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                  }`}
                >
                  Category
                </th>
                <th
                  className={`px-4 py-4 text-left text-sm font-semibold ${
                    darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                  }`}
                >
                  Quantity
                </th>
                <th
                  className={`px-4 py-4 text-left text-sm font-semibold ${
                    darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                  }`}
                >
                  Supplier
                </th>
                <th
                  className={`px-4 py-4 text-left text-sm font-semibold ${
                    darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                  }`}
                >
                  Date Received
                </th>
                <th
                  className={`px-4 py-4 text-left text-sm font-semibold ${
                    darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                  }`}
                >
                  Batch Number
                </th>
                <th
                  className={`px-4 py-4 text-center text-sm font-semibold ${
                    darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={
                darkMode
                  ? "divide-y divide-[#374151]"
                  : "divide-y divide-[#E5E7EB]"
              }
            >
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center">
                    <Package
                      className={`w-12 h-12 mx-auto mb-3 ${
                        darkMode ? "text-[#6B7280]" : "text-[#9CA3AF]"
                      }`}
                    />
                    <p
                      className={`text-sm ${
                        darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
                      }`}
                    >
                      No products found
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`${
                      darkMode ? "hover:bg-[#111827]" : "hover:bg-[#F9FAFB]"
                    } transition-colors`}
                  >
                    <td
                      className={`px-4 py-4 text-sm font-medium ${
                        darkMode ? "text-white" : "text-[#111827]"
                      }`}
                    >
                      {product.productName}
                    </td>
                    <td
                      className={`px-4 py-4 text-sm ${
                        darkMode ? "text-[#D1D5DB]" : "text-[#6B7280]"
                      }`}
                    >
                      {product.category}
                    </td>
                    <td
                      className={`px-4 py-4 text-sm ${
                        darkMode ? "text-[#D1D5DB]" : "text-[#6B7280]"
                      }`}
                    >
                      {product.quantity}
                    </td>
                    <td
                      className={`px-4 py-4 text-sm ${
                        darkMode ? "text-[#D1D5DB]" : "text-[#6B7280]"
                      }`}
                    >
                      {product.supplier}
                    </td>
                    <td
                      className={`px-4 py-4 text-sm ${
                        darkMode ? "text-[#D1D5DB]" : "text-[#6B7280]"
                      }`}
                    >
                      {new Date(product.dateReceived).toLocaleDateString()}
                    </td>
                    <td
                      className={`px-4 py-4 text-sm ${
                        darkMode ? "text-[#D1D5DB]" : "text-[#6B7280]"
                      }`}
                    >
                      {product.batchNumber}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className={`p-2 rounded-lg transition-all ${
                            darkMode
                              ? "hover:bg-[#374151] text-[#60A5FA]"
                              : "hover:bg-[#E5E7EB] text-[#1E3A8A]"
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className={`p-2 rounded-lg transition-all ${
                            darkMode
                              ? "hover:bg-[#374151] text-[#F87171]"
                              : "hover:bg-[#E5E7EB] text-[#DC2626]"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-2xl rounded-lg shadow-2xl ${
              darkMode ? "bg-[#1F2937]" : "bg-white"
            }`}
          >
            <div
              className={`flex items-center justify-between p-6 border-b ${
                darkMode ? "border-[#374151]" : "border-[#E5E7EB]"
              }`}
            >
              <h2
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-[#111827]"
                }`}
              >
                {editingProduct ? "Edit Product In" : "Add Product In"}
              </h2>
              <button
                onClick={handleCloseModal}
                className={`p-2 rounded-lg transition-all ${
                  darkMode
                    ? "hover:bg-[#374151] text-[#9CA3AF]"
                    : "hover:bg-[#F3F4F6] text-[#6B7280]"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                    }`}
                  >
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
                      darkMode
                        ? "bg-[#111827] border-[#374151] text-white"
                        : "bg-white border-[#E5E7EB] text-[#111827]"
                    } focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                    }`}
                  >
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
                      darkMode
                        ? "bg-[#111827] border-[#374151] text-white"
                        : "bg-white border-[#E5E7EB] text-[#111827]"
                    } focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                    }`}
                  >
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
                      darkMode
                        ? "bg-[#111827] border-[#374151] text-white"
                        : "bg-white border-[#E5E7EB] text-[#111827]"
                    } focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                    }`}
                  >
                    Supplier *
                  </label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
                      darkMode
                        ? "bg-[#111827] border-[#374151] text-white"
                        : "bg-white border-[#E5E7EB] text-[#111827]"
                    } focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                    }`}
                  >
                    Date Received *
                  </label>
                  <input
                    type="date"
                    name="dateReceived"
                    value={formData.dateReceived}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
                      darkMode
                        ? "bg-[#111827] border-[#374151] text-white"
                        : "bg-white border-[#E5E7EB] text-[#111827]"
                    } focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                    }`}
                  >
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
                      darkMode
                        ? "bg-[#111827] border-[#374151] text-white"
                        : "bg-white border-[#E5E7EB] text-[#111827]"
                    } focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                    }`}
                  >
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
                      darkMode
                        ? "bg-[#111827] border-[#374151] text-white"
                        : "bg-white border-[#E5E7EB] text-[#111827]"
                    } focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                    darkMode
                      ? "bg-[#374151] text-white hover:bg-[#4B5563]"
                      : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1E3A8A] text-white rounded-lg font-medium hover:bg-[#1E40AF] transition-all shadow-lg shadow-blue-500/30"
                >
                  {editingProduct ? "Update" : "Add"} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
