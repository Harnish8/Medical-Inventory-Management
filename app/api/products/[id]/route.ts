import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { ProductCategory } from "@/models/ProductCategory";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const product = await Product.findById(params.id).populate({
      path: 'categoryId',
      model: ProductCategory
    });
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    return NextResponse.json(product, { status: 200 });
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

    return NextResponse.json({ message: "Product updated successfully", product: updatedProduct }, { status: 200 });
  } catch (error: any) {
    console.error("Product Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
