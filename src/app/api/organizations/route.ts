import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(organizations);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let organization: any = null;
  try {
    const session = await auth();
    if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user?.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const website = formData.get("website") as string | null;
    const phone = formData.get("phone") as string | null;
    const email = formData.get("email") as string | null;
    const logoFile = formData.get("logo") as File | null;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    let logoUrl: string | null = null;

    // Handle logo upload - store as base64 for now, replace with UploadThing in production
    if (logoFile && logoFile.size > 0) {
      const bytes = await logoFile.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      logoUrl = `data:${logoFile.type};base64,${base64}`;
    }

    organization = await prisma.organization.create({
      data: {
        name,
        description,
        website: website || null,
        phone: phone || null,
        email: email || null,
        logoUrl,
      },
    });

    // Call backend AI API
    const apiUrl = process.env.API_URL || "http://localhost:8000";
    const token = process.env.API_TOKEN;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const res = await fetch(`${apiUrl}/embeddings/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: organization.description,
        category: "",
        doc_id: organization.id,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // if (res.ok) {
    //   const data = await res.json();
    //   console.log("AI API response:", data);
    // }
    if (!res.ok) {
      // const data = await res.json();
      // console.log("AI API response:", data);
      throw new Error(`Embedding API failed with status ${res.status}`);
    }
    
    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error(error);
    // Rollback: delete the org from DB if it was created
    if (organization?.id) {
      await prisma.organization.delete({ where: { id: organization.id } }).catch(() => {});
    }
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
