import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { withCache } from "@/lib/cache";
import { Product } from "@/models/Product";
import { Batch } from "@/models/Batch";

const thirtyDaysFromNow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
};

// Cached alerts — 30s TTL
const fetchAlerts = withCache(
  "alerts",
  async () => {
    const [lowStockData, expiryAlerts] = await Promise.all([
      Product.aggregate([
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
              { $project: { quantityCurrent: 1 } },
            ],
            as: "batches",
          },
        },
        { $addFields: { totalStock: { $sum: "$batches.quantityCurrent" } } },
        { $match: { $expr: { $lte: ["$totalStock", "$minStockLevel"] } } },
        { $project: { batches: 0 } },
      ]),
      Batch.find({
        status: "Active",
        quantityCurrent: { $gt: 0 },
        expiryDate: { $lte: thirtyDaysFromNow() },
      })
        .populate({ path: "productId", model: Product, select: "productName" })
        .sort({ expiryDate: 1 })
        .lean(),
    ]);

    const now = new Date();
    return {
      lowStockAlerts: lowStockData,
      expiryAlerts: expiryAlerts.map((b: any) => ({
        ...b,
        isExpired: new Date(b.expiryDate) < now,
      })),
    };
  },
  30
);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await fetchAlerts();

    const response = NextResponse.json(data, { status: 200 });
    response.headers.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60");
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
