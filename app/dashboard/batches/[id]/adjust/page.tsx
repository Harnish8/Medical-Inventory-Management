"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AdjustBatchPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [batchInfo, setBatchInfo] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    adjustmentType: "Decrease",
    quantity: "",
    reason: "",
  });

  useEffect(() => {
    // We need a GET API to fetch batch details. We haven't created one yet, so we'll mock it temporarily
    // Wait, let's assume we can fetch it, or we'll create `app/api/batches/[id]/route.ts` next
    const fetchBatch = async () => {
      try {
        const res = await fetch(`/api/batches/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBatchInfo(data);
        }
      } catch (err) {
        console.error("Failed to fetch batch", err);
      }
    };
    if (id) fetchBatch();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/batches/${id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        alert("Stock adjusted successfully!");
        router.push("/dashboard/batches");
      } else {
        const errorData = await res.json();
        alert(`Failed to adjust stock: ${errorData.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error adjusting stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/batches" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Adjust Batch Stock</h1>
          <p className="text-gray-500 text-sm">Manually increase or decrease stock for this batch.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        
        {batchInfo && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-2">Batch: {batchInfo.batchId}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="block text-gray-400 text-xs uppercase">Current Stock</span>
                <span className="font-bold text-gray-900 text-lg">{batchInfo.quantityCurrent} units</span>
              </div>
              <div>
                <span className="block text-gray-400 text-xs uppercase">Product</span>
                <span className="font-medium text-gray-900">{batchInfo.productId?.productName || "Loading..."}</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type *</label>
            <select
              name="adjustmentType"
              required
              value={formData.adjustmentType}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
            >
              <option value="Decrease">Decrease Stock (Remove units)</option>
              <option value="Increase">Increase Stock (Add units)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Adjust *</label>
            <input
              type="number"
              name="quantity"
              min="1"
              required
              value={formData.quantity}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              placeholder="e.g. 5"
            />
            {formData.adjustmentType === "Decrease" && batchInfo && Number(formData.quantity) > batchInfo.quantityCurrent && (
               <p className="text-xs text-red-500 mt-1">Cannot decrease more than current stock ({batchInfo.quantityCurrent})</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Adjustment *</label>
            <select
              name="reason"
              required
              value={formData.reason}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
            >
              <option value="">Select Reason</option>
              {formData.adjustmentType === "Decrease" ? (
                <>
                  <option value="Damaged/Broken">Damaged / Broken</option>
                  <option value="Expired">Expired Stock</option>
                  <option value="Theft/Lost">Theft / Lost</option>
                  <option value="Stock Audit Correction">Stock Audit Correction</option>
                </>
              ) : (
                <>
                  <option value="Found Missing Stock">Found Missing Stock</option>
                  <option value="Stock Audit Correction">Stock Audit Correction</option>
                  <option value="Initial Count Error">Initial Count Error</option>
                </>
              )}
            </select>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
            <Link 
              href="/dashboard/batches"
              className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 font-medium rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || (formData.adjustmentType === "Decrease" && batchInfo && Number(formData.quantity) > batchInfo.quantityCurrent)}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-blue-800 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70"
            >
              <CheckCircle size={18} />
              <span>{loading ? "Processing..." : "Confirm Adjustment"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
