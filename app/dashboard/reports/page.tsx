import { TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight, IndianRupee } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import { CustomerBill } from "@/models/CustomerBill";
import { Batch } from "@/models/Batch";
import { InventoryMovement } from "@/models/InventoryMovement";
import { Product } from "@/models/Product";

export default async function ReportsPage() {
  await dbConnect();
  
  // Calculate This Month vs Last Month Sales
  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonthBills = await CustomerBill.find({
    createdAt: { $gte: firstDayThisMonth }
  }).lean();
  
  const lastMonthBills = await CustomerBill.find({
    createdAt: { $gte: firstDayLastMonth, $lte: lastDayLastMonth }
  }).lean();

  const thisMonthSales = thisMonthBills.reduce((acc, bill) => acc + bill.totalAmount, 0);
  const lastMonthSales = lastMonthBills.reduce((acc, bill) => acc + bill.totalAmount, 0);
  
  const salesGrowth = lastMonthSales === 0 ? 100 : ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100;

  // Calculate Total Profit (Selling Price - Cost Price for all sold batches)
  // For MVP, we will estimate profit based on recent bills
  const recentBills = await CustomerBill.find().sort({ createdAt: -1 }).limit(100).lean();
  const totalRecentSales = recentBills.reduce((acc, bill) => acc + bill.totalAmount, 0);
  const totalRecentTax = recentBills.reduce((acc, bill) => acc + bill.taxAmount, 0);
  const estimatedProfit = (totalRecentSales - totalRecentTax) * 0.20; // Rough 20% estimate for report

  // Fetch recent movements
  const recentMovements = await InventoryMovement.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate({ path: 'productId', model: Product })
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500 text-sm">Financial overview and inventory movement tracking.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium">
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sales Report Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
              <TrendingUp size={20} />
            </div>
            <h2 className="font-semibold text-gray-900">This Month Sales</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">₹{thisMonthSales.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${salesGrowth >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {salesGrowth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(salesGrowth).toFixed(1)}%
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
            <h2 className="font-semibold text-gray-900">Est. Profit (Last 100 Bills)</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">₹{estimatedProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
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
          <p className="text-3xl font-bold text-gray-900 mb-2">{thisMonthBills.length}</p>
          <p className="text-xs text-gray-500 mt-2">Unique transactions generated</p>
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Inventory Movements</h2>
        
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
              {recentMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No recent movements</td>
                </tr>
              ) : (
                recentMovements.map((mov: any) => (
                  <tr key={mov._id.toString()} className="text-sm">
                    <td className="px-6 py-4 text-gray-600">{new Date(mov.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{(mov.productId as any)?.productName || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                        mov.movementType === 'In' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
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
      </div>

    </div>
  );
}
