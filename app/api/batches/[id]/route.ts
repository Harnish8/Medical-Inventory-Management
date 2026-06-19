import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { Batch } from "@/models/Batch";
import { Product } from "@/models/Product";
import { Dealer } from "@/models/Dealer";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const batch = await Batch.findById(params.id)
      .populate({ path: 'productId', model: Product })
      .populate({ path: 'dealerId', model: Dealer });
      
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }
    
    return NextResponse.json(batch, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
