import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { ProductCategory } from "@/models/ProductCategory";

export default async function ProductsPage() {
  await dbConnect();
  
  // Fetch products and populate category
  const products = await Product.find({}).populate({
    path: 'categoryId',
    model: ProductCategory
  }).lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-gray-500 text-sm">Manage your inventory products and minimum stock levels.</p>
        </div>
        <Link 
          href="/dashboard/products/new" 
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Add Product</span>
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
              placeholder="Search products by name or ID..."
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
                <th className="px-6 py-4 font-medium">Product ID</th>
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Min Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No products found. Click "Add Product" to create one.
                  </td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product._id.toString()} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {product.productId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{product.productName}</p>
                      {product.genericName && (
                        <p className="text-xs text-gray-500 font-medium">{product.genericName}</p>
                      )}
                      {product.manufacturer && (
                        <p className="text-xs text-gray-400 mt-0.5">by {product.manufacturer}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Unit: {product.unitType}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.categoryId?.categoryName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.minStockLevel} units
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/products/${product._id.toString()}/edit`} className="text-primary hover:text-blue-800 text-sm font-medium mr-3">Edit</Link>
                      <button className="text-gray-500 hover:text-gray-700 text-sm font-medium">Batches</button>
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
