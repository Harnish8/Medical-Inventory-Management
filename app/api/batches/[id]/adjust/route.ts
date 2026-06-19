import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Batch } from "@/models/Batch";
import { InventoryAdjustment } from "@/models/InventoryAdjustment";
import { InventoryMovement } from "@/models/InventoryMovement";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adjustmentType, quantity, reason } = await req.json();
    await dbConnect();

    const batch = await Batch.findById(params.id);
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const adjQuantity = Number(quantity);
    if (isNaN(adjQuantity) || adjQuantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const oldQuantity = batch.quantityCurrent;
    let newQuantity = oldQuantity;

    if (adjustmentType === "Decrease") {
      if (oldQuantity < adjQuantity) {
        return NextResponse.json({ error: "Cannot decrease below zero" }, { status: 400 });
      }
      newQuantity = oldQuantity - adjQuantity;
    } else if (adjustmentType === "Increase") {
      newQuantity = oldQuantity + adjQuantity;
    } else {
      return NextResponse.json({ error: "Invalid adjustment type" }, { status: 400 });
    }

    // Update batch
    batch.quantityCurrent = newQuantity;
    if (newQuantity === 0) {
      batch.status = "SoldOut";
    } else if (newQuantity > 0 && batch.status === "SoldOut") {
      batch.status = "Active"; // if they accidentally zeroed it out and increased it back
    }
    await batch.save();

    // Record adjustment audit
    const adjustmentRecord = await InventoryAdjustment.create({
      batchId: batch._id,
      productId: batch.productId,
      adjustedByUserId: (session.user as any).id,
      adjustmentType,
      quantityChanged: adjQuantity,
      quantityBefore: oldQuantity,
      quantityAfter: newQuantity,
      reason: reason || "Manual Adjustment",
      status: "Approved" // Auto-approved for admins
    });

    // Record inventory movement
    await InventoryMovement.create({
      batchId: batch._id,
      productId: batch.productId,
      movementType: adjustmentType === "Increase" ? "In" : "Out",
      quantityChanged: adjQuantity,
      quantityBefore: oldQuantity,
      quantityAfter: newQuantity,
      referenceId: `ADJ-${adjustmentRecord._id}`,
      userId: (session.user as any).id,
      reason: "Manual Adjustment"
    });

    return NextResponse.json({ message: "Stock adjusted successfully", batch }, { status: 200 });
  } catch (error: any) {
    console.error("Batch Adjustment Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
