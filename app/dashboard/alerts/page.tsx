"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, AlertCircle, Package } from "lucide-react";
import Link from "next/link";

function SkeletonCard() {
  return (
    <div className="animate-pulse p-6 border-b border-gray-100">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
  );
}

export default function AlertsPage() {
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [expiryAlerts, setExpiryAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((data) => {
        setLowStockAlerts(data.lowStockAlerts || []);
        setExpiryAlerts(data.expiryAlerts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts &amp; Notifications</h1>
          <p className="text-gray-500 text-sm">Action items requiring your immediate attention.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center justify-between">
            <h2 className="font-semibold text-orange-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-600" />
              Low Stock Alerts {!loading && `(${lowStockAlerts.length})`}
            </h2>
          </div>
          <div className="p-0">
            {loading ? (
              <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
            ) : lowStockAlerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">All products are adequately stocked.</div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {lowStockAlerts.map((product: any) => (
                  <li key={product._id.toString()} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link href={`/dashboard/products/${product._id.toString()}/edit`} className="font-medium text-gray-900 hover:text-primary">
                          {product.productName}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">Minimum required: {product.minStockLevel}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xl font-bold ${product.totalStock === 0 ? "text-red-600" : "text-orange-600"}`}>
                          {product.totalStock}
                        </span>
                        <p className="text-xs text-gray-500">{product.unitType}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Link
                        href="/dashboard/batches/new"
                        className="text-xs font-medium px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Order Stock
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Expiry Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
            <h2 className="font-semibold text-red-900 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-600" />
              Expiry Alerts {!loading && `(${expiryAlerts.length})`}
            </h2>
          </div>
          <div className="p-0">
            {loading ? (
              <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
            ) : expiryAlerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No batches expiring within 30 days.</div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {expiryAlerts.map((batch: any) => (
                  <li key={batch._id.toString()} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/batches/${batch._id.toString()}`} className="font-medium text-gray-900 hover:text-primary">
                            {(batch.productId as any)?.productName || "Unknown Product"}
                          </Link>
                          {batch.isExpired ? (
                            <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Expired</span>
                          ) : (
                            <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Expiring</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Batch ID: {batch.batchId}</p>
                        <p className="text-sm text-gray-500">Remaining Stock: {batch.quantityCurrent}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${batch.isExpired ? "text-red-600" : "text-orange-600"}`}>
                          {new Date(batch.expiryDate).toLocaleDateString()}
                        </span>
                        <p className="text-xs text-gray-500">Expiry Date</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Link
                        href={`/dashboard/batches/${batch._id.toString()}/adjust`}
                        className="text-xs font-medium px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-red-600 hover:text-red-700 hover:border-red-200"
                      >
                        Adjust / Remove
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
