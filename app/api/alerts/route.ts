import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Batch } from "@/models/Batch";

const thirtyDaysFromNow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

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
    const data = {
      lowStockAlerts: lowStockData,
      expiryAlerts: expiryAlerts.map((b: any) => ({
        ...b,
        isExpired: new Date(b.expiryDate) < now,
      })),
    };

    const response = NextResponse.json(data, { status: 200 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
