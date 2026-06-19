import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import { Batch } from "@/models/Batch";
import { Product } from "@/models/Product";
import { Dealer } from "@/models/Dealer";
import { InventoryMovement } from "@/models/InventoryMovement";

export default async function ViewBatchPage({ params }: { params: { id: string } }) {
  await dbConnect();
  
  const batch = await Batch.findById(params.id)
    .populate({ path: 'productId', model: Product })
    .populate({ path: 'dealerId', model: Dealer })
    .lean();

  if (!batch) {
    return <div>Batch not found.</div>;
  }

  // Fetch all movements for this batch (timeline)
  const movements = await InventoryMovement.find({ batchId: batch._id })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/batches" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batch Details: {batch.batchId}</h1>
          <p className="text-gray-500 text-sm">View complete history and stock movements for this batch.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Stock Status</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-bold text-gray-900">{batch.quantityCurrent}</span>
              <span className="text-gray-500 mb-1">/ {batch.quantityReceived} remaining</span>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-2 mb-6 mt-4">
              <div 
                className={`h-2 rounded-full ${batch.quantityCurrent > 0 ? 'bg-primary' : 'bg-red-500'}`} 
                style={{ width: `${(batch.quantityCurrent / batch.quantityReceived) * 100}%` }}
              ></div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="block text-xs text-gray-500 mb-1">Product</span>
                <span className="font-medium text-gray-900">{(batch.productId as any)?.productName}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Expiry Date</span>
                <span className="font-medium text-gray-900">{new Date(batch.expiryDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Cost Price (per unit)</span>
                <span className="font-medium text-gray-900">₹{batch.costPricePerUnit}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Selling Price (per unit)</span>
                <span className="font-medium text-gray-900">₹{batch.sellingPricePerUnit}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Dealer</span>
                <span className="font-medium text-gray-900">{(batch.dealerId as any)?.dealerName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-6">Inventory Timeline</h2>
            
            <div className="space-y-6">
              {movements.map((mov: any, idx: number) => (
                <div key={mov._id.toString()} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      mov.movementType === 'In' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      <Clock size={16} />
                    </div>
                    {idx !== movements.length - 1 && (
                      <div className="w-px h-full bg-gray-200 my-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {mov.movementType === 'In' ? '+' : '-'}{mov.quantityChanged} units
                        </h4>
                        <p className="text-sm text-gray-500">{mov.reason}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(mov.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-6">
                      <div>
                        <span className="block text-xs text-gray-500">Before</span>
                        <span className="font-medium text-sm text-gray-900">{mov.quantityBefore}</span>
                      </div>
                      <div className="text-gray-300">→</div>
                      <div>
                        <span className="block text-xs text-gray-500">After</span>
                        <span className="font-medium text-sm text-gray-900">{mov.quantityAfter}</span>
                      </div>
                      {mov.referenceId && (
                        <div className="ml-auto text-right">
                          <span className="block text-xs text-gray-500">Ref ID</span>
                          <span className="font-mono text-xs text-gray-600">{mov.referenceId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
