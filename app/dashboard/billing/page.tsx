export const revalidate = 30; // revalidate every 30 seconds

import { Plus, Search, FileText } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import { CustomerBill } from "@/models/CustomerBill";

export default async function BillingPage() {
  await dbConnect();
  
  // Fetch bills — exclude the heavy embedded `items` array (not needed for list view)
  // and cap at 50 most recent records
  const bills = await CustomerBill.find({})
    .select("-items") // items array can be huge; fetch only on detail view
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Bill ID, Customer Name..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
            />
          </div>
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
              {bills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <FileText size={24} className="text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No bills generated yet</h3>
                      <p className="text-gray-500 mb-6 max-w-sm">
                        Start making sales by generating your first customer bill.
                      </p>
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
                bills.map((bill: any) => (
                  <tr key={bill._id.toString()} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {bill.billId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{bill.customerName}</p>
                      <p className="text-xs text-gray-500">{bill.customerType}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {bill.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">₹{bill.totalAmount.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/billing/${bill._id.toString()}`} className="text-primary hover:text-blue-800 text-sm font-medium mr-3">View</Link>
                      <Link href={`/dashboard/billing/${bill._id.toString()}?print=true`} className="text-gray-500 hover:text-gray-700 text-sm font-medium">Print</Link>
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
