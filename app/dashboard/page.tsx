"use client";

import { useState, useEffect } from "react";
import { Package, Layers, AlertTriangle, XCircle, TrendingUp, DollarSign } from "lucide-react";
import { useSession } from "next-auth/react";

function MetricCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 animate-pulse">
      <div className="p-4 rounded-xl bg-gray-100 w-14 h-14" />
      <div className="flex-1">
        <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-6 bg-gray-300 rounded w-16" />
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, bg }: { title: string; value: string; icon: React.ReactNode; bg: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-4 rounded-xl ${bg}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function AlertCard({ title, value, type, icon }: { title: string; value: string; type: "critical" | "warning"; icon: React.ReactNode }) {
  const isCritical = type === "critical";
  return (
    <div className={`p-6 rounded-2xl border flex items-center justify-between ${isCritical ? "border-red-100 bg-red-50" : "border-orange-100 bg-orange-50"}`}>
      <div>
        <p className={`text-sm font-medium mb-1 ${isCritical ? "text-red-700" : "text-orange-700"}`}>{title}</p>
        <p className={`text-3xl font-bold ${isCritical ? "text-red-700" : "text-orange-700"}`}>{value}</p>
      </div>
      <div className="opacity-80">{icon}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const isAdmin = session?.user?.role === "Admin" || stats?.role === "Admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {session?.user?.name}</p>
        </div>
      </div>

      {/* Admin Metrics */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <><MetricCardSkeleton /><MetricCardSkeleton /><MetricCardSkeleton /><MetricCardSkeleton /></>
          ) : (
            <>
              <MetricCard title="Total Products" value={stats?.totalProducts?.toString() ?? "0"} icon={<Package className="text-blue-500" />} bg="bg-blue-50" />
              <MetricCard title="Active Batches" value={stats?.totalBatches?.toString() ?? "0"} icon={<Layers className="text-indigo-500" />} bg="bg-indigo-50" />
              <MetricCard title="Inventory Value" value={`₹${(stats?.totalValue ?? 0).toLocaleString("en-IN")}`} icon={<DollarSign className="text-green-500" />} bg="bg-green-50" />
              <MetricCard title="Today's Sales" value={`₹${(stats?.todaysSalesValue ?? 0).toLocaleString("en-IN")}`} icon={<TrendingUp className="text-emerald-500" />} bg="bg-emerald-50" />
            </>
          )}
        </div>
      )}

      {/* Alerts Section */}
      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Attention Required</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <><MetricCardSkeleton /><MetricCardSkeleton /><MetricCardSkeleton /><MetricCardSkeleton /></>
        ) : (
          <>
            <AlertCard title="Out of Stock" value={stats?.outOfStockCount?.toString() ?? "0"} type="critical" icon={<XCircle className="text-red-500" />} />
            <AlertCard title="Low Stock" value={stats?.lowStockCount?.toString() ?? "0"} type="warning" icon={<AlertTriangle className="text-orange-500" />} />
            <AlertCard title="Expiring Soon" value={stats?.expiringBatches?.toString() ?? "0"} type="warning" icon={<AlertTriangle className="text-orange-500" />} />
            <AlertCard title="Expired Stock" value={stats?.expiredBatches?.toString() ?? "0"} type="critical" icon={<XCircle className="text-red-500" />} />
          </>
        )}
      </div>
    </div>
  );
}
