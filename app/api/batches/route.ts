import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Batch } from "@/models/Batch";
import { Product } from "@/models/Product";
import { Dealer } from "@/models/Dealer";
import { InventoryMovement } from "@/models/InventoryMovement";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    // For MVP, if dealer is temp_id, create a dummy dealer
    let dealerId = body.dealerId;
    if (dealerId === "temp_id" || !dealerId) {
      let dummyDealer = await Dealer.findOne();
      if (!dummyDealer) {
        dummyDealer = await Dealer.create({
          dealerName: "Default Supplier",
          contactPerson: "John Doe",
          phone: "9999999999",
          email: "supplier@example.com",
          address: "City",
          gstin: "22AAAAA0000A1Z5"
        });
      }
      dealerId = dummyDealer._id;
    }

    // Handle product ID the same way if it's "temp_id"
    let productId = body.productId;
    if (productId === "temp_id") {
       const product = await Product.findOne();
       if(product) productId = product._id;
    }

    // Generate batch ID
    const count = await Batch.countDocuments();
    const batchId = `BATCH-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const newBatch = await Batch.create({
      batchId,
      productId,
      dealerId,
      costPricePerUnit: Number(body.costPricePerUnit),
      sellingPricePerUnit: Number(body.sellingPricePerUnit),
      quantityReceived: Number(body.quantityReceived),
      quantityCurrent: Number(body.quantityReceived), // initially full
      expiryDate: new Date(body.expiryDate),
      batchLotNumber: body.batchLotNumber,
      invoiceDate: new Date(body.invoiceDate),
      invoiceNumber: body.invoiceNumber || `INV-${Date.now()}`,
      createdByUserId: (session.user as any).id
    });

    // Record Inventory Movement
    await InventoryMovement.create({
      batchId: newBatch._id,
      productId: productId,
      movementType: "In",
      quantityChanged: newBatch.quantityReceived,
      quantityBefore: 0,
      quantityAfter: newBatch.quantityReceived,
      referenceId: newBatch.invoiceNumber,
      userId: (session.user as any).id,
      reason: "New Batch Received"
    });

    return NextResponse.json({ message: "Batch created successfully", batch: newBatch }, { status: 201 });
  } catch (error: any) {
    console.error("Batch Creation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
