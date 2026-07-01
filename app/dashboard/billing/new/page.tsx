"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Printer, AlertTriangle, Package, CheckCircle2, Info, ChevronDown } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductWithStock {
  _id: string;
  productId: string;
  productName: string;
  genericName?: string;
  unitType: string;
  gstPercentage: number;
  manufacturer?: string;
  totalAvailableStock: number;
  sellingPricePerUnit: number;
  inStock: boolean;
}

interface BillItem {
  productId: string;
  quantity: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount: number) {
  return amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Sub-component: Single item row ───────────────────────────────────────────

function ItemRow({
  item,
  index,
  products,
  onItemChange,
  onRemove,
  canRemove,
}: {
  item: BillItem;
  index: number;
  products: ProductWithStock[];
  onItemChange: (index: number, field: keyof BillItem, value: any) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  const selectedProduct = products.find((p) => p._id === item.productId);
  const maxQty = selectedProduct?.totalAvailableStock ?? Infinity;
  const isQuantityExceeded = selectedProduct && item.quantity > maxQty;

  const unitPrice = selectedProduct?.sellingPricePerUnit ?? 0;
  const gst = selectedProduct?.gstPercentage ?? 0;
  const lineBase = unitPrice * item.quantity;
  const lineTax = lineBase * (gst / 100);
  const lineTotal = lineBase + lineTax;

  return (
    <div
      className={`p-4 border rounded-xl relative transition-all ${
        isQuantityExceeded
          ? "border-red-300 bg-red-50"
          : selectedProduct && !selectedProduct.inStock
          ? "border-amber-300 bg-amber-50"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* Row badge */}
      <span className="absolute -top-2.5 left-3 bg-white border border-gray-200 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
        #{index + 1}
      </span>

      {/* Product selector + quantity row */}
      <div className="flex items-start gap-3 mt-1">
        {/* Product selector — takes all available width */}
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Product
          </label>
          <div className="relative">
            <select
              value={item.productId}
              required
              onChange={(e) => onItemChange(index, "productId", e.target.value)}
              className="block w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-white text-sm appearance-none"
            >
              <option value="">— Select product —</option>
              {products.map((p) => (
                <option
                  key={p._id}
                  value={p._id}
                  disabled={!p.inStock}
                  className={!p.inStock ? "text-gray-400" : ""}
                >
                  {!p.inStock ? "⊘ " : ""}
                  {p.productName}
                  {p.genericName ? ` (${p.genericName})` : ""}
                  {!p.inStock
                    ? " — Out of Stock"
                    : ` — ${p.totalAvailableStock} ${p.unitType}`}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Contextual hint */}
          {selectedProduct ? (
            selectedProduct.inStock ? (
              <p className="text-xs text-blue-600 mt-1.5 flex items-center gap-1 flex-wrap">
                <Info size={11} />
                FIFO · GST {selectedProduct.gstPercentage}% · ₹{fmt(selectedProduct.sellingPricePerUnit)}/{selectedProduct.unitType}
              </p>
            ) : (
              <p className="text-xs text-amber-600 font-medium mt-1.5 flex items-center gap-1">
                <AlertTriangle size={11} />
                Out of stock
              </p>
            )
          ) : (
            products.length === 0 && (
              <p className="text-xs text-red-500 mt-1.5">
                No products found. Create a product first!
              </p>
            )
          )}
        </div>

        {/* Quantity */}
        <div className="w-24 shrink-0">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Qty
            {selectedProduct?.inStock && (
              <span className="ml-1 text-gray-400 text-[10px]">/{maxQty}</span>
            )}
          </label>
          <input
            type="number"
            min={1}
            max={selectedProduct?.inStock ? maxQty : 1}
            required
            value={item.quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              onItemChange(index, "quantity", val);
            }}
            className={`block w-full px-3 py-2.5 border rounded-lg focus:ring-primary focus:border-primary bg-white text-sm text-center font-medium ${
              isQuantityExceeded ? "border-red-400 text-red-600" : "border-gray-200"
            }`}
          />
          {isQuantityExceeded && (
            <p className="text-[10px] text-red-600 mt-1 text-center">Max {maxQty}</p>
          )}
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          className="p-2 mt-6 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-20 shrink-0"
          title="Remove item"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Line total — visible on all screen sizes */}
      {selectedProduct?.inStock && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">Line Total (incl. GST)</span>
          <span className="text-sm font-semibold text-gray-800">₹{fmt(lineTotal)}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NewBillPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [products, setProducts] = useState<ProductWithStock[]>([]);

  const [customerData, setCustomerData] = useState({
    customerName: "",
    customerType: "Individual",
    customerPhone: "",
    paymentMethod: "Cash",
  });

  const [items, setItems] = useState<BillItem[]>([{ productId: "", quantity: 1 }]);

  // ── Fetch products with live stock info ──────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const res = await fetch("/api/products/with-stock");
        if (res.ok) {
          const data: ProductWithStock[] = await res.json();
          data.sort((a, b) => {
            if (a.inStock === b.inStock) return a.productName.localeCompare(b.productName);
            return a.inStock ? -1 : 1;
          });
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ── Item handlers ────────────────────────────────────────────────────────
  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index: number, field: keyof BillItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;

      if (field === "productId") {
        updated[index].quantity = 1;
      }

      if (field === "quantity") {
        const product = products.find((p) => p._id === updated[index].productId);
        if (product && product.inStock) {
          updated[index].quantity = Math.max(1, Math.min(value, product.totalAvailableStock));
        }
      }

      return updated;
    });
  };

  const addItem = () => setItems((prev) => [...prev, { productId: "", quantity: 1 }]);

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // ── Live totals ──────────────────────────────────────────────────────────
  const { subtotal, gstTotal, grandTotal, hasErrors } = useMemo(() => {
    let subtotal = 0;
    let gstTotal = 0;
    let hasErrors = false;

    for (const item of items) {
      if (!item.productId) continue;
      const product = products.find((p) => p._id === item.productId);
      if (!product || !product.inStock) continue;

      const lineBase = product.sellingPricePerUnit * item.quantity;
      const lineTax = lineBase * (product.gstPercentage / 100);

      if (item.quantity > product.totalAvailableStock) hasErrors = true;

      subtotal += lineBase;
      gstTotal += lineTax;
    }

    return { subtotal, gstTotal, grandTotal: subtotal + gstTotal, hasErrors };
  }, [items, products]);

  // ── Form validation ──────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (items.some((item) => !item.productId)) return "Please select a product for all items.";
    if (items.some((item) => item.quantity < 1)) return "All quantities must be at least 1.";

    for (const item of items) {
      const product = products.find((p) => p._id === item.productId);
      if (!product) continue;
      if (!product.inStock)
        return `"${product.productName}" is out of stock and cannot be billed.`;
      if (item.quantity > product.totalAvailableStock)
        return `Quantity for "${product.productName}" exceeds available stock (${product.totalAvailableStock}).`;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      alert(err);
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
        router.push("/dashboard/billing");
      } else {
        const errorData = await res.json();
        alert(`Failed to generate bill: ${errorData.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error generating bill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inStockCount = products.filter((p) => p.inStock).length;
  const canSubmit = !loading && !productsLoading && products.length > 0 && !hasErrors;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    /* Extra bottom padding on mobile to clear the sticky footer */
    <div className="max-w-5xl mx-auto space-y-6 pb-28 sm:pb-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/billing"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Generate New Bill</h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Stock is automatically deducted using FIFO rules.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: Customer & Payment ─────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              Customer Details
            </h2>
            <div className="space-y-4">
              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  required
                  value={customerData.customerName}
                  onChange={handleCustomerChange}
                  className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary bg-gray-50 text-sm"
                  placeholder="e.g. John Doe"
                />
              </div>

              {/* Customer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Customer Type
                </label>
                <div className="relative">
                  <select
                    name="customerType"
                    value={customerData.customerType}
                    onChange={handleCustomerChange}
                    className="block w-full pl-3 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary bg-gray-50 text-sm appearance-none"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={customerData.customerPhone}
                  onChange={handleCustomerChange}
                  className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary bg-gray-50 text-sm"
                  placeholder="+91 98765 43210"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Cash", "Card", "Online Transfer"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setCustomerData((prev) => ({ ...prev, paymentMethod: method }))}
                      className={`py-2.5 px-2 rounded-xl text-xs font-medium border transition-all text-center ${
                        customerData.paymentMethod === method
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {method === "Online Transfer" ? "UPI" : method}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stock overview */}
          {!productsLoading && products.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Stock Overview
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 text-center p-3 bg-green-50 rounded-xl">
                  <p className="text-2xl font-bold text-green-700">{inStockCount}</p>
                  <p className="text-xs text-green-600 mt-0.5">In Stock</p>
                </div>
                <div className="flex-1 text-center p-3 bg-red-50 rounded-xl">
                  <p className="text-2xl font-bold text-red-700">{products.length - inStockCount}</p>
                  <p className="text-xs text-red-600 mt-0.5">Out of Stock</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Products & Totals ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            {/* Section header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">Products</h2>
                {productsLoading && (
                  <span className="text-xs text-gray-400 animate-pulse">Loading…</span>
                )}
                {!productsLoading && (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <Package size={10} />
                    {inStockCount} in stock
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            {/* Item rows */}
            <div className="space-y-4">
              {productsLoading ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm">Loading product catalogue…</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <ItemRow
                    key={index}
                    item={item}
                    index={index}
                    products={products}
                    onItemChange={handleItemChange}
                    onRemove={removeItem}
                    canRemove={items.length > 1}
                  />
                ))
              )}
            </div>

            {/* ── Invoice Summary (visible only on desktop / in form) ── */}
            <div className="hidden sm:block mt-8 border-t border-gray-100 pt-6">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-5 rounded-xl border border-blue-100 space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Invoice Summary
                </h3>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900 tabular-nums">₹{fmt(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>GST Total</span>
                  <span className="font-medium text-gray-900 tabular-nums">₹{fmt(gstTotal)}</span>
                </div>

                <div className="pt-3 border-t border-blue-200 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Grand Total</span>
                  <span className={`text-2xl font-bold tabular-nums transition-all duration-300 ${grandTotal > 0 ? "text-primary" : "text-gray-400"}`}>
                    ₹{fmt(grandTotal)}
                  </span>
                </div>

                {grandTotal > 0 && (
                  <p className="flex items-center gap-1 text-xs text-green-600 mt-1">
                    <CheckCircle2 size={11} />
                    Live total · updates as you add items
                  </p>
                )}

                {hasErrors && (
                  <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                    <AlertTriangle size={11} />
                    Some quantities exceed available stock — please correct before submitting.
                  </p>
                )}
              </div>

              {/* Desktop submit */}
              <div className="mt-5 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-blue-800 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Printer size={18} />
                  <span>{loading ? "Processing…" : "Generate Bill & Deduct Stock"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* ── MOBILE STICKY FOOTER ─────────────────────────────────────────── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl p-4 safe-area-pb">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">Subtotal</p>
            <p className="text-xs text-gray-500">GST</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-gray-700 tabular-nums">₹{fmt(subtotal)}</p>
            <p className="text-xs font-medium text-gray-700 tabular-nums">₹{fmt(gstTotal)}</p>
          </div>
          <div className="ml-4 pl-4 border-l border-gray-200">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Grand Total</p>
            <p className={`text-xl font-bold tabular-nums ${grandTotal > 0 ? "text-primary" : "text-gray-400"}`}>
              ₹{fmt(grandTotal)}
            </p>
          </div>
        </div>

        {hasErrors && (
          <p className="flex items-center gap-1 text-xs text-red-600 mb-2">
            <AlertTriangle size={11} />
            Stock quantities exceeded — fix before submitting.
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            const form = document.querySelector("form") as HTMLFormElement | null;
            if (form) form.requestSubmit();
          }}
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary hover:bg-blue-800 text-white font-semibold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-base"
        >
          <Printer size={20} />
          <span>{loading ? "Processing…" : "Generate Bill & Deduct Stock"}</span>
        </button>
      </div>
    </div>
  );
}
