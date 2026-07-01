"use client";

import { useState, useEffect } from "react";
import { TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight, IndianRupee } from "lucide-react";
import Pagination from "@/components/Pagination";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-8 bg-gray-300 rounded w-2/3 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
    </div>
  );
}

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

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const salesGrowth =
    data?.lastMonthSales === 0
      ? 100
      : ((data?.thisMonthSales - data?.lastMonthSales) / data?.lastMonthSales) * 100;

  const allMovements: any[] = data?.recentMovements ?? [];
  const paginatedMovements = allMovements.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics &amp; Reports</h1>
          <p className="text-gray-500 text-sm">Financial overview and inventory movement tracking.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium">
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            {/* Sales Report Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
                  <TrendingUp size={20} />
                </div>
                <h2 className="font-semibold text-gray-900">This Month Sales</h2>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">₹{(data?.thisMonthSales ?? 0).toLocaleString("en-IN")}</p>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${salesGrowth >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {salesGrowth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(salesGrowth || 0).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </div>

            {/* Estimated Profit Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <IndianRupee size={20} />
                </div>
                <h2 className="font-semibold text-gray-900">Est. Profit (Last Month)</h2>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">₹{(data?.estimatedProfit ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-gray-500 mt-2">Calculated after deducting GST</p>
            </div>

            {/* Total Bills Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <BarChart3 size={20} />
                </div>
                <h2 className="font-semibold text-gray-900">Total Invoices (Month)</h2>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{data?.thisMonthBillCount ?? 0}</p>
              <p className="text-xs text-gray-500 mt-2">Unique transactions generated</p>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Inventory Movements</h2>
          {!loading && allMovements.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">{allMovements.length} total movements</p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
              ) : !paginatedMovements.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No recent movements</td>
                </tr>
              ) : (
                paginatedMovements.map((mov: any) => (
                  <tr key={mov._id.toString()} className="text-sm">
                    <td className="px-6 py-4 text-gray-600">{new Date(mov.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{(mov.productId as any)?.productName || "Unknown"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${mov.movementType === "In" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {mov.movementType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{mov.quantityChanged}</td>
                    <td className="px-6 py-4 text-gray-500">{mov.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && (
          <Pagination
            totalItems={allMovements.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          />
        )}
      </div>
    </div>
  );
}
