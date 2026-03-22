import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Call backend AI API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const token = process.env.NEXT_PUBLIC_API_TOKEN;

    let summary = "";
    let matchedOrganizations: any[] = [];

    try {
      // const res = await fetch(`${apiUrl}/search`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ query }),
      // });
      console.log("Sending query to AI API:", query);
      const res = await fetch(`${apiUrl}/process/my-session4`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, 
        },
        body: JSON.stringify({"query": query }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("AI API response:", data);
        summary = data.summary || "";
        // const ids: string[] = data.organization_ids || [];
        const ids: string[] = data.ids || [];

        if (ids.length > 0) {
          matchedOrganizations = await prisma.organization.findMany({
            where: { id: { in: ids }, isActive: true },
          });
        }
      }
    } catch (error) {
      console.error("AI API error:", error);
      // Fallback: simple keyword search from DB
      const organizations = await prisma.organization.findMany({
        where: { isActive: true },
      });

      const keywords = query.toLowerCase().split(" ");
      matchedOrganizations = organizations.filter((org) =>
        keywords.some(
          (kw: string) =>
            org.name.toLowerCase().includes(kw) ||
            org.description.toLowerCase().includes(kw)
        )
      );

      summary =
        matchedOrganizations.length > 0
          ? `Based on your situation, here are ${matchedOrganizations.length} organization${matchedOrganizations.length !== 1 ? "s" : ""} that may be able to help you.`
          : "We understand you are going through a difficult time. Currently, we could not find a direct match, but please reach out to emergency services if you are in immediate danger.";
    }

    // Log the search
    await prisma.searchLog.create({
      data: {
        query,
        results: { summary, count: matchedOrganizations.length },
      },
    });

    return NextResponse.json({
      summary,
      organizations: matchedOrganizations,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
