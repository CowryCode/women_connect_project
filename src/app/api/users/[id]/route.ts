import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Only superadmin can change roles
    if (body.role && session.user?.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prevent modifying superadmin accounts
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });
    if (targetUser?.role === "SUPERADMIN") {
      return NextResponse.json(
        { error: "Cannot modify superadmin" },
        { status: 403 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
