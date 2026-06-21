import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { withCache } from "@/lib/cache";
import { CustomerBill } from "@/models/CustomerBill";
import { InventoryMovement } from "@/models/InventoryMovement";
import { Product } from "@/models/Product";

// Reports cached 5 minutes — financial summaries don't need real-time precision
const fetchReports = withCache(
  "reports",
  async () => {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [monthlySales, recentMovements] = await Promise.all([
      CustomerBill.aggregate([
        { $match: { createdAt: { $gte: firstDayLastMonth } } },
        {
          $group: {
            _id: { $gte: ["$createdAt", firstDayThisMonth] },
            total: { $sum: "$totalAmount" },
            tax: { $sum: "$taxAmount" },
            count: { $sum: 1 },
          },
        },
      ]),
      InventoryMovement.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate({ path: "productId", model: Product, select: "productName" })
        .lean(),
    ]);

    const thisMonth = monthlySales.find((m: any) => m._id === true) || { total: 0, count: 0 };
    const lastMonth = monthlySales.find((m: any) => m._id === false) || { total: 0, tax: 0 };

    return {
      thisMonthSales: thisMonth.total,
      thisMonthBillCount: thisMonth.count,
      lastMonthSales: lastMonth.total,
      estimatedProfit: (lastMonth.total - ((lastMonth as any).tax || 0)) * 0.2,
      recentMovements,
    };
  },
  300 // 5 minute TTL
);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await fetchReports();

    const response = NextResponse.json(data);
    response.headers.set("Cache-Control", "private, max-age=300, stale-while-revalidate=600");
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
