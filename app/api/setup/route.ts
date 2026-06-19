import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  try {
    await dbConnect();
    
    // Check if any admin exists
    const adminExists = await User.findOne({ role: "Admin" });
    
    if (adminExists) {
      return NextResponse.json({ message: "Admin already exists. Setup skipped." }, { status: 200 });
    }

    const hashedPassword = await bcrypt.hash("admin123", 12);
    
    const newAdmin = new User({
      username: "admin",
      email: "admin@kirtanmedical.com",
      password: hashedPassword,
      role: "Admin",
      status: "Active",
    });

    await newAdmin.save();

    return NextResponse.json({ 
      message: "Admin user created successfully", 
      credentials: { username: "admin", password: "admin123" } 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
