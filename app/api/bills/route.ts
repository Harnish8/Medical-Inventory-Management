import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { revalidateTag } from "next/cache";
import { CustomerBill } from "@/models/CustomerBill";
import { Batch } from "@/models/Batch";
import { Product } from "@/models/Product";
import { InventoryMovement } from "@/models/InventoryMovement";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const limit = limitParam ? parseInt(limitParam) : 5;

    await dbConnect();

    const matchStage: any = {};
    if (fromParam || toParam) {
      matchStage.createdAt = {};
      if (fromParam) matchStage.createdAt.$gte = new Date(fromParam);
      if (toParam) {
        const toDate = new Date(toParam);
        toDate.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = toDate;
      }
    }

    const pipeline: any[] = [
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      { $sort: { createdAt: -1 } },
      { $limit: limit },
      { $addFields: { itemCount: { $size: { $ifNull: ["$items", []] } } } },
      { $project: { items: 0 } },
    ];

    const bills = await CustomerBill.aggregate(pipeline);

    const response = NextResponse.json(bills, { status: 200 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { customerName, customerType, customerPhone, paymentMethod, items } = body;

    await dbConnect();

    // Calculate total amount and process items with FIFO logic
    let totalAmount = 0;
    let taxAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
      }

      let remainingQuantityToDeduct = item.quantity;
      let totalCostPriceForItem = 0;

      // Find all active batches for this product, sorted by expiry date (oldest first - FIFO)
      const availableBatches = await Batch.find({
        productId: product._id,
        status: "Active",
        quantityCurrent: { $gt: 0 },
        expiryDate: { $gte: new Date() } // don't sell expired stock
      }).sort({ expiryDate: 1 });

      const totalAvailable = availableBatches.reduce((acc, b) => acc + b.quantityCurrent, 0);

      if (totalAvailable < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for ${product.productName}. Requested: ${item.quantity}, Available: ${totalAvailable}` 
        }, { status: 400 });
      }

      // FIFO Deduction Logic
      for (const batch of availableBatches) {
        if (remainingQuantityToDeduct <= 0) break;

        const quantityToDeductFromThisBatch = Math.min(batch.quantityCurrent, remainingQuantityToDeduct);
        
        // Calculate costs and prices
        // Use the explicit selling price set during batch creation, fallback to 20% markup for old batches
        const unitPrice = batch.sellingPricePerUnit || (batch.costPricePerUnit * 1.2); 
        const lineTotal = unitPrice * quantityToDeductFromThisBatch;
        const lineTax = lineTotal * (product.gstPercentage / 100);

        processedItems.push({
          productId: product._id,
          batchId: batch._id,
          quantity: quantityToDeductFromThisBatch,
          unitPrice: unitPrice,
          costPrice: batch.costPricePerUnit,
          taxAmount: lineTax,
          lineTotal: lineTotal
        });

        totalAmount += lineTotal + lineTax;
        taxAmount += lineTax;
        totalCostPriceForItem += (batch.costPricePerUnit * quantityToDeductFromThisBatch);

        // Deduct stock from batch
        const oldQuantity = batch.quantityCurrent;
        batch.quantityCurrent -= quantityToDeductFromThisBatch;
        
        if (batch.quantityCurrent === 0) {
          batch.status = "SoldOut";
        }
        await batch.save();

        // Record Inventory Movement
        await InventoryMovement.create({
          batchId: batch._id,
          productId: product._id,
          movementType: "Out",
          quantityChanged: quantityToDeductFromThisBatch,
          quantityBefore: oldQuantity,
          quantityAfter: batch.quantityCurrent,
          referenceId: "Customer Bill",
          userId: (session.user as any).id,
          reason: "Customer Sale"
        });

        remainingQuantityToDeduct -= quantityToDeductFromThisBatch;
      }
    }

    // Generate unique bill ID
    const billCount = await CustomerBill.countDocuments();
    const billId = `BILL-${new Date().getFullYear()}-${String(billCount + 1).padStart(4, '0')}`;

    // Create the bill
    const newBill = await CustomerBill.create({
      billId,
      customerName,
      customerType,
      customerPhone,
      paymentMethod,
      totalAmount,
      taxAmount,
      generatedByUserId: (session.user as any).id,
      items: processedItems
    });

    // Bust all caches — billing affects stock, inventory, dashboard, and alerts
    revalidateTag("bills");
    revalidateTag("batches");
    revalidateTag("inventory");
    revalidateTag("dashboard-stats");
    revalidateTag("alerts");

    return NextResponse.json({ message: "Bill generated successfully", billId }, { status: 201 });

  } catch (error: any) {
    console.error("Billing Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
