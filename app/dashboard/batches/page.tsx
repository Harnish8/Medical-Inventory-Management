export const revalidate = 30; // revalidate every 30 seconds

import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import { Batch } from "@/models/Batch";
import { Product } from "@/models/Product";
import { Dealer } from "@/models/Dealer";

export default async function BatchesPage() {
  await dbConnect();
  
  // Fetch batches with pagination cap — populate product/dealer for display
  const batches = await Batch.find({})
    .populate([{ path: 'productId', model: Product }, { path: 'dealerId', model: Dealer }])
    .sort({ expiryDate: 1 })
    .limit(100) // cap at 100; add pagination UI if needed
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batch Inventory</h1>
          <p className="text-gray-500 text-sm">Manage stock at the batch level to track expiry dates and FIFO.</p>
        </div>
        <Link 
          href="/dashboard/batches/new" 
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Receive Stock (New Batch)</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Batch ID or Product Name..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            <Filter size={18} />
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="px-6 py-4 font-medium">Batch ID</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Dealer</th>
                <th className="px-6 py-4 font-medium">Expiry Date</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No batches found. Click "Receive Stock" to add a batch.
                  </td>
                </tr>
              ) : (
                batches.map((batch: any) => {
                  const expiryDate = new Date(batch.expiryDate);
                  const isExpired = expiryDate < new Date();
                  const isExpiringSoon = !isExpired && (expiryDate.getTime() - new Date().getTime()) < 30 * 24 * 60 * 60 * 1000;
                  
                  let statusBadge = "bg-green-100 text-green-800";
                  if (batch.status === 'SoldOut') statusBadge = "bg-gray-100 text-gray-800";
                  else if (isExpired || batch.status === 'Expired') statusBadge = "bg-red-100 text-red-800";
                  else if (isExpiringSoon) statusBadge = "bg-orange-100 text-orange-800";

                  return (
                    <tr key={batch._id.toString()} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {batch.batchId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{batch.productId?.productName}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {batch.dealerId?.dealerName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm font-medium ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-gray-900'}`}>
                          {expiryDate.toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{batch.quantityCurrent} / {batch.quantityReceived}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge}`}>
                          {batch.status === 'SoldOut' ? 'Sold Out' : isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/dashboard/batches/${batch._id.toString()}`} className="text-primary hover:text-blue-800 text-sm font-medium mr-3">View</Link>
                        <Link href={`/dashboard/batches/${batch._id.toString()}/adjust`} className="text-gray-500 hover:text-gray-700 text-sm font-medium">Adjust</Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
