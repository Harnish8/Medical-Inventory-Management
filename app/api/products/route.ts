import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { ProductCategory } from "@/models/ProductCategory";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    // In a real app we'd validate categoryId, but for MVP we'll create a dummy category if none exists
    let category = await ProductCategory.findOne();
    if (!category) {
      category = await ProductCategory.create({
        categoryName: "General Medicines",
        description: "Default category"
      });
    }

    // Generate product ID
    const count = await Product.countDocuments();
    const productId = `PRD-${String(count + 1).padStart(4, '0')}`;

    const newProduct = await Product.create({
      ...body,
      productId,
      categoryId: body.categoryId === "temp_id" || !body.categoryId ? category._id : body.categoryId,
    });

    return NextResponse.json({ message: "Product created successfully", product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("Product Creation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({ status: "Active" });
    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
