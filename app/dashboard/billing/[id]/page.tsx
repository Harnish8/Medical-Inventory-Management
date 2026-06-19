import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import { CustomerBill } from "@/models/CustomerBill";
import { Product } from "@/models/Product";
import PrintButton from "@/components/PrintButton";

export default async function ViewBillPage({ params }: { params: { id: string } }) {
  await dbConnect();
  
  const bill = await CustomerBill.findById(params.id).populate({
    path: 'items.productId',
    model: Product
  }).lean();

  if (!bill) {
    return <div>Bill not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 print:m-0 print:space-y-0">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/billing" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice {bill.billId}</h1>
          </div>
        </div>
        <PrintButton />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 print:shadow-none print:border-none print:p-0">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-100 pb-8 print:pb-4 gap-6 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm print:bg-black">
                K
              </div>
              <h2 className="font-bold text-xl text-gray-900">Kirtan Medical Store</h2>
            </div>
            <p className="text-sm text-gray-500">123 Health Avenue, Medical District</p>
            <p className="text-sm text-gray-500">Contact: +91 99999 00000</p>
            <p className="text-sm text-gray-500">GSTIN: 22AAAAA0000A1Z5</p>
          </div>
          
          <div className="text-left sm:text-right">
            <h1 className="text-3xl font-bold text-gray-200 uppercase tracking-widest print:text-black">Invoice</h1>
            <p className="font-medium text-gray-900 mt-2">{bill.billId}</p>
            <p className="text-sm text-gray-500">Date: {new Date(bill.createdAt).toLocaleDateString()}</p>
            <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium mt-2 print:border print:border-black">
              <CheckCircle2 size={14} /> Paid ({bill.paymentMethod})
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="py-6 border-b border-gray-100 print:py-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 print:text-black">Billed To:</h3>
          <p className="font-semibold text-gray-900 text-lg">{bill.customerName}</p>
          <p className="text-sm text-gray-600">{bill.customerType}</p>
          {bill.customerPhone && <p className="text-sm text-gray-600">Phone: {bill.customerPhone}</p>}
        </div>

        {/* Items Table */}
        <div className="py-6 print:py-4 overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="border-b-2 border-gray-100 text-gray-600 text-sm print:border-black">
                <th className="py-3 font-medium">Description</th>
                <th className="py-3 font-medium text-center">Qty</th>
                <th className="py-3 font-medium text-right">Unit Price</th>
                <th className="py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bill.items.map((item: any, index: number) => (
                <tr key={index} className="text-sm">
                  <td className="py-4">
                    <p className="font-medium text-gray-900">{item.productId?.productName || 'Unknown Product'}</p>
                    <p className="text-xs text-gray-500">HSN: {item.productId?.hsnCode} | GST: {item.productId?.gstPercentage}%</p>
                  </td>
                  <td className="py-4 text-center text-gray-900">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-900">₹{item.unitPrice.toFixed(2)}</td>
                  <td className="py-4 text-right font-medium text-gray-900">₹{(item.unitPrice * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end pt-6 print:pt-4">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">₹{(bill.totalAmount - bill.taxAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>GST</span>
              <span className="font-medium text-gray-900">₹{bill.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-t-2 border-gray-900 pt-3 print:border-black">
              <span className="font-bold text-gray-900">Grand Total</span>
              <span className="text-2xl font-bold text-primary print:text-black">₹{bill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-100 text-center text-xs text-gray-500 print:mt-8 print:pt-4">
          <p>Thank you for your business!</p>
          <p>Goods once sold will not be taken back or exchanged.</p>
        </div>
      </div>
    </div>
  );
}
