import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Package, Layers, AlertTriangle, XCircle, TrendingUp, DollarSign } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Batch } from "@/models/Batch";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Connect to DB and fetch real metrics
  await dbConnect();
  
  const totalProducts = await Product.countDocuments({ status: "Active" });
  const totalBatches = await Batch.countDocuments({ status: "Active" });
  
  // Aggregate inventory value
  const batches = await Batch.find({ status: "Active" });
  const totalValue = batches.reduce((acc, batch) => acc + (batch.costPricePerUnit * batch.quantityCurrent), 0);
  
  // Find low stock products
  const products = await Product.find({ status: "Active" });
  let lowStockCount = 0;
  let outOfStockCount = 0;
  
  for (const product of products) {
    const productBatches = await Batch.find({ productId: product._id, status: "Active" });
    const currentStock = productBatches.reduce((acc, b) => acc + b.quantityCurrent, 0);
    
    if (currentStock === 0) outOfStockCount++;
    else if (currentStock <= product.minStockLevel) lowStockCount++;
  }

  // Calculate expiring soon (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const expiringBatches = await Batch.countDocuments({
    status: "Active",
    quantityCurrent: { $gt: 0 },
    expiryDate: { $lte: thirtyDaysFromNow }
  });
  
  const expiredBatches = await Batch.countDocuments({
    status: "Active",
    quantityCurrent: { $gt: 0 },
    expiryDate: { $lte: new Date() }
  });

  // Calculate Today's Sales
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const { CustomerBill } = await import("@/models/CustomerBill");
  const todaysBills = await CustomerBill.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const todaysSalesValue = todaysBills.reduce((acc, bill) => acc + bill.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {session?.user?.name}</p>
        </div>
      </div>

      {/* Admin Metrics */}
      {session?.user?.role === "Admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Total Products" 
            value={totalProducts.toString()} 
            icon={<Package className="text-blue-500" />} 
            bg="bg-blue-50" 
          />
          <MetricCard 
            title="Active Batches" 
            value={totalBatches.toString()} 
            icon={<Layers className="text-indigo-500" />} 
            bg="bg-indigo-50" 
          />
          <MetricCard 
            title="Inventory Value" 
            value={`₹${totalValue.toLocaleString('en-IN')}`} 
            icon={<DollarSign className="text-green-500" />} 
            bg="bg-green-50" 
          />
          <MetricCard 
            title="Today's Sales" 
            value={`₹${todaysSalesValue.toLocaleString('en-IN')}`} 
            icon={<TrendingUp className="text-emerald-500" />} 
            bg="bg-emerald-50" 
          />
        </div>
      )}

      {/* Alerts Section */}
      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Attention Required</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AlertCard 
          title="Out of Stock" 
          value={outOfStockCount.toString()} 
          type="critical" 
          icon={<XCircle className="text-red-500" />} 
        />
        <AlertCard 
          title="Low Stock" 
          value={lowStockCount.toString()} 
          type="warning" 
          icon={<AlertTriangle className="text-orange-500" />} 
        />
        <AlertCard 
          title="Expiring Soon" 
          value={expiringBatches.toString()} 
          type="warning" 
          icon={<AlertTriangle className="text-orange-500" />} 
        />
        <AlertCard 
          title="Expired Stock" 
          value={expiredBatches.toString()} 
          type="critical" 
          icon={<XCircle className="text-red-500" />} 
        />
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, bg }: { title: string, value: string, icon: React.ReactNode, bg: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-4 rounded-xl ${bg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function AlertCard({ title, value, type, icon }: { title: string, value: string, type: 'critical' | 'warning', icon: React.ReactNode }) {
  const isCritical = type === 'critical';
  const borderColor = isCritical ? 'border-red-100' : 'border-orange-100';
  const bgColor = isCritical ? 'bg-red-50' : 'bg-orange-50';
  const textColor = isCritical ? 'text-red-700' : 'text-orange-700';

  return (
    <div className={`p-6 rounded-2xl border ${borderColor} ${bgColor} flex items-center justify-between`}>
      <div>
        <p className={`text-sm font-medium ${textColor} mb-1`}>{title}</p>
        <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      </div>
      <div className="opacity-80">
        {icon}
      </div>
    </div>
  );
}
