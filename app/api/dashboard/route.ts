import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { withCache } from "@/lib/cache";
import { Product } from "@/models/Product";
import { Batch } from "@/models/Batch";
import { CustomerBill } from "@/models/CustomerBill";

// Dashboard stats — cached 60s (today's sales is accurate enough at 1-min granularity)
const fetchDashboardStats = withCache(
  "dashboard-stats",
  async () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalProducts,
      totalBatches,
      valueAgg,
      products,
      stockAgg,
      expiringBatches,
      expiredBatches,
      salesAgg,
    ] = await Promise.all([
      Product.countDocuments({ status: "Active" }),
      Batch.countDocuments({ status: "Active" }),
      Batch.aggregate([
        { $match: { status: "Active" } },
        { $group: { _id: null, total: { $sum: { $multiply: ["$costPricePerUnit", "$quantityCurrent"] } } } },
      ]),
      Product.find({ status: "Active" }, { _id: 1, minStockLevel: 1 }).lean(),
      Batch.aggregate([
        { $match: { status: "Active" } },
        { $group: { _id: "$productId", totalStock: { $sum: "$quantityCurrent" } } },
      ]),
      Batch.countDocuments({ status: "Active", quantityCurrent: { $gt: 0 }, expiryDate: { $lte: thirtyDaysFromNow } }),
      Batch.countDocuments({ status: "Active", quantityCurrent: { $gt: 0 }, expiryDate: { $lte: new Date() } }),
      CustomerBill.aggregate([
        { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const totalValue = valueAgg[0]?.total ?? 0;
    const stockMap = Object.fromEntries(
      (stockAgg as any[]).map((s) => [s._id.toString(), s.totalStock])
    );

    let lowStockCount = 0;
    let outOfStockCount = 0;
    for (const product of products as any[]) {
      const stock = stockMap[product._id.toString()] ?? 0;
      if (stock === 0) outOfStockCount++;
      else if (stock <= product.minStockLevel) lowStockCount++;
    }

    return {
      totalProducts,
      totalBatches,
      totalValue,
      todaysSalesValue: salesAgg[0]?.total ?? 0,
      lowStockCount,
      outOfStockCount,
      expiringBatches,
      expiredBatches,
    };
  },
  60 // 60 second TTL
);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await fetchDashboardStats();

    const response = NextResponse.json({
      ...stats,
      role: session.user?.role,
      userName: session.user?.name,
    });
    response.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=120");
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
