"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, FileText, Trash2, Calendar, ChevronDown } from "lucide-react";
import Link from "next/link";

type FilterPreset = "today" | "10days" | "1month" | "6months" | "1year" | "custom" | "last5";

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

function getDateRange(preset: FilterPreset): { from: string; to: string } | null {
  const now = new Date();
  const toStr = now.toISOString().split("T")[0];

  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split("T")[0];
  };

  switch (preset) {
    case "today":      return { from: toStr, to: toStr };
    case "10days":     return { from: daysAgo(10), to: toStr };
    case "1month":     return { from: daysAgo(30), to: toStr };
    case "6months":    return { from: daysAgo(180), to: toStr };
    case "1year":      return { from: daysAgo(365), to: toStr };
    default:           return null;
  }
}

const PRESET_LABELS: Record<FilterPreset, string> = {
  last5: "Last 5 Bills",
  today: "Today",
  "10days": "10 Days",
  "1month": "1 Month",
  "6months": "6 Months",
  "1year": "1 Year",
  custom: "Custom",
};

export default function BillingPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activePreset, setActivePreset] = useState<FilterPreset>("last5");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const fetchBills = useCallback(async (preset: FilterPreset, cFrom?: string, cTo?: string) => {
    setLoading(true);
    try {
      let url = "/api/bills";
      if (preset === "last5") {
        url = "/api/bills?limit=5";
      } else if (preset === "custom") {
        const from = cFrom || customFrom;
        const to = cTo || customTo;
        if (!from || !to) { setLoading(false); return; }
        url = `/api/bills?from=${from}&to=${to}&limit=500`;
      } else {
        const range = getDateRange(preset);
        if (range) url = `/api/bills?from=${range.from}&to=${range.to}&limit=500`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setBills(Array.isArray(data) ? data : []);
    } catch {
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, [customFrom, customTo]);

  useEffect(() => { fetchBills("last5"); }, []);

  const handlePreset = (preset: FilterPreset) => {
    setActivePreset(preset);
    setShowCustom(preset === "custom");
    if (preset !== "custom") {
      fetchBills(preset);
    }
  };

  const handleCustomApply = () => {
    if (!customFrom || !customTo) { alert("Please select both From and To dates."); return; }
    fetchBills("custom", customFrom, customTo);
  };

  const handleDelete = async (id: string, billId: string) => {
    if (!confirm(`Delete bill "${billId}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/bills/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBills((prev) => prev.filter((b) => b._id.toString() !== id));
      } else {
        const err = await res.json();
        alert(`Failed to delete: ${err.error}`);
      }
    } catch {
      alert("Error deleting bill");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = bills.filter((b) =>
    b.billId?.toLowerCase().includes(search.toLowerCase()) ||
    b.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  const presets: FilterPreset[] = ["last5", "today", "10days", "1month", "6months", "1year", "custom"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing &amp; Invoices</h1>
          <p className="text-gray-500 text-sm">Generate customer bills and view transaction history.</p>
        </div>
        <Link
          href="/dashboard/billing/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Generate New Bill</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Filter by Date</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePreset(preset)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activePreset === preset
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {PRESET_LABELS[preset]}
            </button>
          ))}
        </div>

        {showCustom && (
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-primary focus:border-primary bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-primary focus:border-primary bg-gray-50"
              />
            </div>
            <button
              onClick={handleCustomApply}
              className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
            >
              Apply Filter
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Bill ID, Customer Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
            />
          </div>
          <span className="text-sm text-gray-400 whitespace-nowrap">
            {!loading && `${filtered.length} bill${filtered.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="px-6 py-4 font-medium">Bill ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Customer Name</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Total Amount</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <>
                  <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
                </>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <FileText size={24} className="text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {search ? "No bills match your search." : "No bills found for this period"}
                      </h3>
                      {!search && (
                        <p className="text-gray-500 mb-6 max-w-sm">Try a different date range or generate a new bill.</p>
                      )}
                      <Link
                        href="/dashboard/billing/new"
                        className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-blue-800 transition-colors shadow-sm"
                      >
                        Generate Bill
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((bill: any) => (
                  <tr key={bill._id.toString()} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {bill.billId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(bill.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{bill.customerName}</p>
                      <p className="text-xs text-gray-500">{bill.customerType}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {bill.itemCount ?? 0} items
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">₹{bill.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/billing/${bill._id.toString()}`}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-primary hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/billing/${bill._id.toString()}?print=true`}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Print
                        </Link>
                        <button
                          onClick={() => handleDelete(bill._id.toString(), bill.billId)}
                          disabled={deletingId === bill._id.toString()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                          {deletingId === bill._id.toString() ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && bills.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            Showing {filtered.length} of {bills.length} bills for {PRESET_LABELS[activePreset]}
            {activePreset === "last5" && " — use a date filter to see more"}
          </div>
        )}
      </div>
    </div>
  );
}
