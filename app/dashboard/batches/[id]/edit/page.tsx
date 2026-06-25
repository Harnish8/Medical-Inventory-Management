"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditBatchPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [batchInfo, setBatchInfo] = useState<any>(null);

  const [formData, setFormData] = useState({
    sellingPricePerUnit: "",
    costPricePerUnit: "",
    expiryDate: "",
    batchLotNumber: "",
    invoiceNumber: "",
    status: "Active",
  });

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const res = await fetch(`/api/batches/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBatchInfo(data);
          setFormData({
            sellingPricePerUnit: data.sellingPricePerUnit?.toString() || "",
            costPricePerUnit: data.costPricePerUnit?.toString() || "",
            expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString().split("T")[0] : "",
            batchLotNumber: data.batchLotNumber || "",
            invoiceNumber: data.invoiceNumber || "",
            status: data.status || "Active",
          });
        } else {
          alert("Failed to load batch details");
          router.push("/dashboard/batches");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchBatch();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/batches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sellingPricePerUnit: Number(formData.sellingPricePerUnit),
          costPricePerUnit: Number(formData.costPricePerUnit),
          expiryDate: new Date(formData.expiryDate),
        }),
      });
      if (res.ok) {
        router.push("/dashboard/batches");
      } else {
        const err = await res.json();
        alert(`Failed to update batch: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error updating batch");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/batches" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Batch</h1>
          <p className="text-gray-500 text-sm">
            <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {batchInfo?.batchId}
            </span>{" "}
            — {batchInfo?.productId?.productName}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (per unit) ₹ *</label>
              <input
                type="number"
                name="costPricePerUnit"
                step="0.01"
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
                name="sellingPricePerUnit"
                step="0.01"
                min="0"
                required
                value={formData.sellingPricePerUnit}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Batch Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch / Lot Number</label>
              <input
                type="text"
                name="batchLotNumber"
                value={formData.batchLotNumber}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="SoldOut">Sold Out</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
          <Link
            href="/dashboard/batches"
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
            <span>{loading ? "Saving..." : "Update Batch"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
