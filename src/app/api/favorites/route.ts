import { NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/mongoose";
import User from "@/app/models/User";
import { getServerSession } from "next-auth/next";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy User" }, { status: 404 });
    }

    return NextResponse.json({ favorites: user.favorites }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const { label, lat, lon } = await req.json();

    if (!label) {
      return NextResponse.json({ message: "Thiếu dữ liệu" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy User" }, { status: 404 });
    }

    // Kiểm tra trùng
    const exists = user.favorites.find((f: any) => f.label === label);
    if (!exists) {
      user.favorites.push({ label, lat, lon });
      await user.save();
    }

    return NextResponse.json({ favorites: user.favorites }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const url = new URL(req.url);
    const label = url.searchParams.get("label");

    if (!label) {
      return NextResponse.json({ message: "Thiếu dữ liệu" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy User" }, { status: 404 });
    }

    user.favorites = user.favorites.filter((f: any) => f.label !== label);
    await user.save();

    return NextResponse.json({ favorites: user.favorites }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
