import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { revalidateTag } from "next/cache";
import { Dealer } from "@/models/Dealer";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const dealer = await Dealer.findById(params.id).lean();

    if (!dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 });
    }

    const response = NextResponse.json(dealer, { status: 200 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    delete body._id;

    const updatedDealer = await Dealer.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedDealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 });
    }

    revalidateTag("dealers");

    return NextResponse.json({ message: "Dealer updated successfully", dealer: updatedDealer }, { status: 200 });
  } catch (error: any) {
    console.error("Dealer Update Error:", error);
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
    const deleted = await Dealer.findByIdAndUpdate(
      params.id,
      { $set: { status: "Inactive" } },
      { new: true }
    );

    if (!deleted) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 });
    }

    revalidateTag("dealers");

    return NextResponse.json({ message: "Dealer deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Dealer Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
