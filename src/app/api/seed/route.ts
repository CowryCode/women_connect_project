import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    const password = await bcrypt.hash("password", 12);

    const superadmin = await prisma.user.upsert({
      where: { email: "user@example.com" },
      update: { name: "your name", password },
      create: {
        name: "your name",
        email: "user@example.com",
        password,
        role: "SUPERADMIN", 
        isActive: true,
      },
    });
    //ROLES: USER / ADMIN / SUPERADMIN

    return NextResponse.json({
      message: "Seed complete",
      superadmin: { email: superadmin.email, role: superadmin.role },
    });
  } catch (error) {
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
