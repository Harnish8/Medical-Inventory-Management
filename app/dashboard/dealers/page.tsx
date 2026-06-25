"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Building2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function DealersPage() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchDealers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dealers");
      const data = await res.json();
      setDealers(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDealers(); }, [fetchDealers]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete dealer "${name}"? They will be marked inactive.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/dealers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDealers((prev) => prev.filter((d) => d._id.toString() !== id));
      } else {
        const err = await res.json();
        alert(`Failed to delete: ${err.error}`);
      }
    } catch {
      alert("Error deleting dealer");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = dealers.filter((d) =>
    d.dealerName?.toLowerCase().includes(search.toLowerCase()) ||
    d.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
    d.gstin?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dealers &amp; Suppliers</h1>
          <p className="text-gray-500 text-sm">Manage your suppliers, contact info, and GST details.</p>
        </div>
        <Link
          href="/dashboard/dealers/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Add Dealer</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Dealer Name, Contact, or GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="px-6 py-4 font-medium">Dealer Name</th>
                <th className="px-6 py-4 font-medium">Contact Person</th>
                <th className="px-6 py-4 font-medium">Phone &amp; Email</th>
                <th className="px-6 py-4 font-medium">GSTIN</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <>
                  <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
                </>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <Building2 size={24} className="text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {search ? "No dealers match your search." : "No dealers found"}
                      </h3>
                      {!search && (
                        <>
                          <p className="text-gray-500 mb-6 max-w-sm">Get started by adding your first supplier.</p>
                          <Link href="/dashboard/dealers/new" className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-blue-800 transition-colors shadow-sm">
                            Add Dealer
                          </Link>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((dealer: any) => (
                  <tr key={dealer._id.toString()} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-xs">
                          {dealer.dealerName.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{dealer.dealerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dealer.contactPerson}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{dealer.phone}</p>
                      <p className="text-xs text-gray-500">{dealer.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {dealer.gstin}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/dealers/${dealer._id.toString()}/edit`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil size={13} /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(dealer._id.toString(), dealer.dealerName)}
                          disabled={deletingId === dealer._id.toString()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                          {deletingId === dealer._id.toString() ? "..." : "Delete"}
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
    </div>
  );
}
