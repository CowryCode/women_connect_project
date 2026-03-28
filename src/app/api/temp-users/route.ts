import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tempUsers = await prisma.tempUser.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, usageCount: true, isActive: true, createdAt: true },
    });

    return NextResponse.json(tempUsers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    const existingTemp = await prisma.tempUser.findUnique({ where: { email } });

    if (existingUser || existingTemp) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const tempUser = await prisma.tempUser.create({
      data: { name, email, password: hashedPassword, usageCount: 10, isActive: true },
      select: { id: true, name: true, email: true, usageCount: true, isActive: true, createdAt: true },
    });

    return NextResponse.json(tempUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create temp user" }, { status: 500 });
  }
}
