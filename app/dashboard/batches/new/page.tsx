"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload } from "lucide-react";
import Link from "next/link";

export default function AddBatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "invoice">("manual");
  const [products, setProducts] = useState([]);
  const [dealers, setDealers] = useState([]);
  
  const [formData, setFormData] = useState({
    productId: "",
    dealerId: "",
    costPricePerUnit: "",
    sellingPricePerUnit: "",
    quantityReceived: "",
    expiryDate: "",
    batchLotNumber: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    invoiceNumber: "",
  });

  useEffect(() => {
    // Fetch actual products and dealers from the database
    const fetchData = async () => {
      try {
        const [prodRes, dealRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/dealers")
        ]);
        
        if (prodRes.ok) setProducts(await prodRes.json());
        if (dealRes.ok) setDealers(await dealRes.json());
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId) {
      alert("Please select a product first!");
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        router.push("/dashboard/batches");
      } else {
        const errorData = await res.json();
        alert(`Failed to add batch: ${errorData.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error adding batch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/batches" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receive Stock</h1>
          <p className="text-gray-500 text-sm">Create a new batch entry for incoming stock.</p>
        </div>
      </div>

      <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 w-fit">
        <button 
          onClick={() => setActiveTab("manual")}
          className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'manual' ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Manual Entry
        </button>
        <button 
          onClick={() => setActiveTab("invoice")}
          className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'invoice' ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Upload Invoice (Auto-Extract)
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8">
        {activeTab === "manual" ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Product & Dealer</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
              <select
                name="productId"
                required
                value={formData.productId}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              >
                <option value="">-- Select Product --</option>
                {products.map((p: any) => (
                  <option key={p._id} value={p._id}>{p.productName}</option>
                ))}
              </select>
              {products.length === 0 && (
                <p className="text-xs text-red-500 mt-1">You must create a Product in the catalog first!</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dealer *</label>
              <select
                name="dealerId"
                required
                value={formData.dealerId}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              >
                <option value="">-- Select Dealer --</option>
                {dealers.map((d: any) => (
                  <option key={d._id} value={d._id}>{d.dealerName}</option>
                ))}
              </select>
              {dealers.length === 0 && (
                <p className="text-xs text-red-500 mt-1">You must create a Dealer in the Dealer directory first!</p>
              )}
            </div>

            <div className="space-y-4 md:col-span-2 mt-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Batch Details</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Received (Units) *</label>
              <input
                type="number"
                name="quantityReceived"
                min="1"
                required
                value={formData.quantityReceived}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (per unit) ₹ *</label>
              <input
                type="number"
                step="0.01"
                name="costPricePerUnit"
                min="0"
                required
                value={formData.costPricePerUnit}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (per unit) ₹ *</label>
              <input
                type="number"
                step="0.01"
                name="sellingPricePerUnit"
                min="0"
                required
                value={formData.sellingPricePerUnit}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
              <input
                type="date"
                name="expiryDate"
                required
                value={formData.expiryDate}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch / Lot Number (Optional)</label>
              <input
                type="text"
                name="batchLotNumber"
                value={formData.batchLotNumber}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              />
            </div>

            <div className="space-y-4 md:col-span-2 mt-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Invoice Details</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
              <input
                type="date"
                name="invoiceDate"
                required
                value={formData.invoiceDate}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number (Optional)</label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              />
            </div>

            <div className="md:col-span-2 mt-8 flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
              <Link 
                href="/dashboard/batches"
                className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 font-medium rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || products.length === 0 || dealers.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-blue-800 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70"
              >
                <Save size={18} />
                <span>{loading ? "Saving..." : "Create Batch"}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Upload size={24} className="text-primary" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Upload Dealer Invoice</h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              Upload a PDF or Image of the dealer bill to automatically extract products, prices, and batches.
            </p>
            <button className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-blue-800 transition-colors shadow-sm">
              Select File
            </button>
            <p className="text-xs text-gray-400 mt-4">Supported formats: PDF, JPG, PNG</p>
          </div>
        )}
      </div>
    </div>
  );
}
