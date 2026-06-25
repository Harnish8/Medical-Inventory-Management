import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { revalidateTag } from "next/cache";
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

    // Bust caches so products list and inventory update immediately
    revalidateTag("products");
    revalidateTag("inventory");
    revalidateTag("dashboard-stats");
    revalidateTag("alerts");

    return NextResponse.json({ message: "Product created successfully", product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("Product Creation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const products = await Product.find({ status: "Active" }).lean();

    const response = NextResponse.json(products, { status: 200 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
