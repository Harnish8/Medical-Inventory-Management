import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { withCache } from "@/lib/cache";
import { Dealer } from "@/models/Dealer";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    const newDealer = await Dealer.create({
      dealerName: body.dealerName,
      contactPerson: body.contactPerson,
      phone: body.phone,
      email: body.email,
      address: body.address,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      gstin: body.gstin,
      licenseNumber: body.licenseNumber,
      paymentTerms: body.paymentTerms,
    });

    return NextResponse.json({ message: "Dealer created successfully", dealer: newDealer }, { status: 201 });
  } catch (error: any) {
    console.error("Dealer Creation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

const fetchDealers = withCache(
  "dealers",
  () => Dealer.find({ status: "Active" }).sort({ createdAt: -1 }).lean(),
  30
);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dealers = await fetchDealers();
    const response = NextResponse.json(dealers, { status: 200 });
    response.headers.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60");
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
