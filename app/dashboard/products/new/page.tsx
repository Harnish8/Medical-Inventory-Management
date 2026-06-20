"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    productName: "",
    genericName: "",
    categoryId: "",
    hsnCode: "",
    gstPercentage: "12",
    unitType: "Strips",
    minStockLevel: "10",
    manufacturer: "",
    description: "",
  });

  // Mock fetching categories on mount since we don't have the API yet
  // In a real app we'd fetch this from /api/categories
  useEffect(() => {
    // For MVP, we'll let the backend create a default category if none provided, 
    // or we can fetch them. Assuming we'll build the API next.
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Create the API route for POST /api/products
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        router.push("/dashboard/products");
      } else {
        alert("Failed to add product");
      }
    } catch (error) {
      console.error(error);
      alert("Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500 text-sm">Create a new product in the catalog. Pricing is handled at the batch level.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4 md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Basic Information</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name (Brand) *</label>
            <input
              type="text"
              name="productName"
              required
              value={formData.productName}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              placeholder="e.g. Crocin 500mg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name / Composition</label>
            <input
              type="text"
              name="genericName"
              value={formData.genericName}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              placeholder="e.g. Paracetamol"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="categoryId"
              required
              value={formData.categoryId}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
            >
              <option value="">Select Category</option>
              <option value="temp_id">Medicines</option>
              <option value="temp_id2">Injections</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer / Company</label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              placeholder="e.g. GSK, Micro Labs"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type *</label>
            <select
              name="unitType"
              required
              value={formData.unitType}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
            >
              <option value="Strips">Strips</option>
              <option value="Bottles">Bottles</option>
              <option value="Boxes">Boxes</option>
              <option value="Pieces">Pieces</option>
              <option value="Tubes">Tubes</option>
            </select>
          </div>

          {/* Tax & Inventory */}
          <div className="space-y-4 md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Tax & Inventory Rules</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code *</label>
            <input
              type="text"
              name="hsnCode"
              required
              value={formData.hsnCode}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              placeholder="e.g. 3004"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST % *</label>
            <select
              name="gstPercentage"
              required
              value={formData.gstPercentage}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
            >
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
              <option value="28">28%</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level</label>
            <input
              type="number"
              name="minStockLevel"
              min="0"
              required
              value={formData.minStockLevel}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Alert triggered when total batch stock falls below this.</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm resize-none"
              placeholder="Product notes or descriptions..."
            ></textarea>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
          <Link 
            href="/dashboard/products"
            className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 font-medium rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-blue-800 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70"
          >
            <Save size={18} />
            <span>{loading ? "Saving..." : "Save Product"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
