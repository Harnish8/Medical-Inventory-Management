import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { withCache } from "@/lib/cache";
import { Product } from "@/models/Product";
import { Batch } from "@/models/Batch";

// Cached fetcher — runs at most once every 30s on Vercel infrastructure
const fetchInventory = withCache(
  "inventory",
  async () =>
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
          nextExpiry: { $arrayElemAt: ["$batches.expiryDate", 0] },
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
      { $project: { batches: 0 } },
    ]),
  30 // revalidate every 30 seconds
);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inventoryData = await fetchInventory();

    const response = NextResponse.json(inventoryData, { status: 200 });
    // Browser also caches for 30s; stale-while-revalidate lets it serve stale while refreshing
    response.headers.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60");
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
