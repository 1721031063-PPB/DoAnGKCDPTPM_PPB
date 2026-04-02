import { NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/mongoose";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Vui lòng nhập đủ thông tin." }, { status: 400 });
    }

    await connectToDatabase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ message: "Email đã tồn tại." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ message: "Tài khoản tạo thành công!", user: newUser._id }, { status: 201 });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json({ message: "Lỗi máy chủ khi đăng ký." }, { status: 500 });
  }
}
