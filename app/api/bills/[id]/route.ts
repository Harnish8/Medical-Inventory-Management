import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { revalidateTag } from "next/cache";
import { CustomerBill } from "@/models/CustomerBill";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const bill = await CustomerBill.findById(params.id).lean();

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    const response = NextResponse.json(bill, { status: 200 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const deleted = await CustomerBill.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    revalidateTag("bills");
    revalidateTag("dashboard-stats");

    return NextResponse.json({ message: "Bill deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Bill Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
