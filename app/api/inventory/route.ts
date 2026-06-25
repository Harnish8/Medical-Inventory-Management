import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Batch } from "@/models/Batch";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const inventoryData = await Product.aggregate([
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
    ]);

    const response = NextResponse.json(inventoryData, { status: 200 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
