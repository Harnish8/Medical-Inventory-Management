import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Batch } from "@/models/Batch";

/**
 * GET /api/products/with-stock
 *
 * Returns all active products enriched with:
 *  - totalAvailableStock: sum of quantityCurrent across active, non-expired batches
 *  - sellingPricePerUnit: price from the oldest (FIFO) active batch (0 if no stock)
 *  - gstPercentage: from the product document
 *
 * Used by the billing form for real-time stock validation and live total calculations.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const products = await Product.find({ status: "Active" }).lean();

    const now = new Date();

    // Aggregate available stock per product from active, non-expired batches
    const stockAgg = await Batch.aggregate([
      {
        $match: {
          status: "Active",
          quantityCurrent: { $gt: 0 },
          expiryDate: { $gte: now },
        },
      },
      {
        $sort: { expiryDate: 1 }, // oldest batch first (FIFO)
      },
      {
        $group: {
          _id: "$productId",
          totalAvailableStock: { $sum: "$quantityCurrent" },
          // Pick the selling price from the oldest (first sorted) batch
          sellingPricePerUnit: { $first: "$sellingPricePerUnit" },
          costPricePerUnit: { $first: "$costPricePerUnit" },
        },
      },
    ]);

    // Build a quick lookup map
    const stockMap: Record<
      string,
      { totalAvailableStock: number; sellingPricePerUnit: number; costPricePerUnit: number }
    > = {};
    for (const entry of stockAgg) {
      stockMap[entry._id.toString()] = {
        totalAvailableStock: entry.totalAvailableStock,
        sellingPricePerUnit: entry.sellingPricePerUnit,
        costPricePerUnit: entry.costPricePerUnit,
      };
    }

    const enriched = products.map((p: any) => {
      const stock = stockMap[p._id.toString()];
      const totalAvailableStock = stock?.totalAvailableStock ?? 0;
      // Use explicit selling price; fallback to 20% markup if not set (matches billing logic)
      const sellingPricePerUnit =
        stock?.sellingPricePerUnit ||
        (stock?.costPricePerUnit ? stock.costPricePerUnit * 1.2 : 0);

      return {
        _id: p._id,
        productId: p.productId,
        productName: p.productName,
        genericName: p.genericName,
        unitType: p.unitType,
        gstPercentage: p.gstPercentage,
        manufacturer: p.manufacturer,
        totalAvailableStock,
        sellingPricePerUnit,
        inStock: totalAvailableStock > 0,
      };
    });

    const response = NextResponse.json(enriched, { status: 200 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


