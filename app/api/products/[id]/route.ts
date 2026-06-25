import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { revalidateTag } from "next/cache";
import { Product } from "@/models/Product";
import { ProductCategory } from "@/models/ProductCategory";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const product = await Product.findById(params.id).populate({
      path: 'categoryId',
      model: ProductCategory
    });
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    const response = NextResponse.json(product, { status: 200 });
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

    // Prevent changing the internal ID
    delete body._id;
    delete body.productId;

    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Bust caches so updated product details show everywhere immediately
    revalidateTag("products");
    revalidateTag("inventory");
    revalidateTag("dashboard-stats");
    revalidateTag("alerts");

    return NextResponse.json({ message: "Product updated successfully", product: updatedProduct }, { status: 200 });
  } catch (error: any) {
    console.error("Product Update Error:", error);
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
    const deleted = await Product.findByIdAndUpdate(
      params.id,
      { $set: { status: "Inactive" } },
      { new: true }
    );

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    revalidateTag("products");
    revalidateTag("inventory");
    revalidateTag("dashboard-stats");
    revalidateTag("alerts");

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Product Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
