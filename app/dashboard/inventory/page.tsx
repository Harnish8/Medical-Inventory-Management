export const revalidate = 30; // revalidate every 30 seconds

import { Search, AlertTriangle, PackageSearch } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Batch } from "@/models/Batch";

export default async function InventoryPage() {
  await dbConnect();
  
  // Single MongoDB aggregation pipeline — joins products + batches on the DB side
  // Much faster than fetching both collections and joining in JS
  const inventoryData: any[] = await Product.aggregate([
    { $match: { status: "Active" } },
    {
      $lookup: {
        from: "batches",
        let: { productId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$productId", "$$productId"] },
              status: "Active",
              quantityCurrent: { $gt: 0 },
            },
          },
          { $sort: { expiryDate: 1 } },
          { $project: { quantityCurrent: 1, costPricePerUnit: 1, expiryDate: 1 } },
        ],
        as: "batches",
      },
    },
    {
      $addFields: {
        totalStock: { $sum: "$batches.quantityCurrent" },
        totalValue: {
          $sum: {
            $map: {
              input: "$batches",
              as: "b",
              in: { $multiply: ["$$b.quantityCurrent", "$$b.costPricePerUnit"] },
            },
          },
        },
        batchCount: { $size: "$batches" },
        nextExpiry: { $arrayElemAt: ["$batches.expiryDate", 0] }, // already sorted asc
      },
    },
    {
      $addFields: {
        stockStatus: {
          $cond: {
            if: { $eq: ["$totalStock", 0] },
            then: "Out of Stock",
            else: {
              $cond: {
                if: { $lte: ["$totalStock", "$minStockLevel"] },
                then: "Low Stock",
                else: "In Stock",
              },
            },
          },
        },
      },
    },
    { $project: { batches: 0 } }, // drop the batches array from the result
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Inventory</h1>
          <p className="text-gray-500 text-sm">Aggregated view of all stock levels across all batches.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search inventory..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Total Stock</th>
                <th className="px-6 py-4 font-medium">Stock Status</th>
                <th className="px-6 py-4 font-medium">Inventory Value</th>
                <th className="px-6 py-4 font-medium">Next Expiry</th>
                <th className="px-6 py-4 font-medium">Active Batches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventoryData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <PackageSearch size={24} className="text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                      <p className="text-gray-500 mb-6 max-w-sm">
                        Create products in the catalog to start tracking inventory.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                inventoryData.map((item: any) => (
                  <tr key={item._id.toString()} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-xs text-gray-500">Min Level: {item.minStockLevel}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 text-lg">{item.totalStock}</span>
                      <span className="text-gray-500 text-xs ml-1">{item.unitType}</span>
                    </td>
                    <td className="px-6 py-4">
                      {item.stockStatus === "Out of Stock" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700">
                          <AlertTriangle size={12} /> Out of Stock
                        </span>
                      ) : item.stockStatus === "Low Stock" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700">
                          <AlertTriangle size={12} /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ₹{item.totalValue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.nextExpiry ? new Date(item.nextExpiry).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.batchCount} batches
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
