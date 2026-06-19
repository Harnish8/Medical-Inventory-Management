"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Printer } from "lucide-react";
import Link from "next/link";

export default function NewBillPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  
  const [customerData, setCustomerData] = useState({
    customerName: "",
    customerType: "Individual",
    customerPhone: "",
    paymentMethod: "Cash",
  });

  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);

  useEffect(() => {
    // Fetch actual products from the database
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchProducts();
  }, []);

  const handleCustomerChange = (e: any) => {
    setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { productId: "", quantity: 1 }]);
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all items have a valid productId
    if (items.some(item => !item.productId)) {
      alert("Please select a valid product for all items!");
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...customerData, items }),
      });
      
      if (res.ok) {
        alert("Bill generated successfully! (FIFO deduction applied)");
        router.push("/dashboard/billing");
      } else {
        const errorData = await res.json();
        alert(`Failed to generate bill: ${errorData.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error generating bill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/billing" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate New Bill</h1>
          <p className="text-gray-500 text-sm">Create a customer invoice. Stock is automatically deducted using FIFO rules.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Customer & Payment Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">Customer Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  name="customerName"
                  required
                  value={customerData.customerName}
                  onChange={handleCustomerChange}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                <select
                  name="customerType"
                  value={customerData.customerType}
                  onChange={handleCustomerChange}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
                >
                  <option value="Individual">Individual</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={customerData.customerPhone}
                  onChange={handleCustomerChange}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
                  placeholder="+91"
                />
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={customerData.paymentMethod}
                  onChange={handleCustomerChange}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Online Transfer">Online Transfer (UPI)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Products & Calculation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Products</h2>
              <button 
                type="button" 
                onClick={addItem}
                className="flex items-center gap-1 text-sm text-primary font-medium hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50 relative">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Select Product</label>
                    <select
                      value={item.productId}
                      required
                      onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-white text-sm"
                    >
                      <option value="">Search product...</option>
                      {products.map((p: any) => (
                        <option key={p._id} value={p._id}>{p.productName}</option>
                      ))}
                    </select>
                    {products.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">You must create a Product in the catalog first!</p>
                    )}
                    <p className="text-xs text-blue-600 mt-1">Oldest batch will be selected automatically (FIFO)</p>
                  </div>
                  
                  <div className="w-32">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-white text-sm"
                    />
                  </div>

                  <button 
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 mt-5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹0.00</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>GST Total</span>
                  <span className="font-medium text-gray-900">₹0.00</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Grand Total</span>
                  <span className="text-2xl font-bold text-primary">₹0.00</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-4">
              <button
                type="submit"
                disabled={loading || products.length === 0}
                className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-blue-800 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 w-full md:w-auto justify-center"
              >
                <Printer size={18} />
                <span>{loading ? "Processing..." : "Generate Bill & Deduct Stock"}</span>
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
