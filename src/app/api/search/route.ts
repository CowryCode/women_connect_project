import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import { API_URL, API_TOKEN, ORG_CATEGORY, TOOL_CATEGORY} from "@/lib/config";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { query, isToolsMode } = await req.json();

    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Block temp users with no credits
    if (session?.user?.isTempUser && session.user.id) {
      const tempUser = await prisma.tempUser.findUnique({
        where: { id: session.user.id },
        select: { usageCount: true },
      });
      if (!tempUser || tempUser.usageCount <= 0) {
        if (tempUser) await prisma.tempUser.delete({ where: { id: session.user.id } });
        return NextResponse.json({ error: "CREDITS_EXHAUSTED" }, { status: 403 });
      }
    }

    // Call backend AI API
    // const apiUrl = process.env.API_URL || "http://localhost:8000";
    // const token = process.env.API_TOKEN;

    let summary = "";
    let matchedOrganizations: any[] = [];

    try {
      // const res = await fetch(`${apiUrl}/search`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ query }),
      // });
      //const aiSessionId = session?.user?.id ?? randomUUID();
      const category = isToolsMode ? TOOL_CATEGORY : ORG_CATEGORY;
      const userID = isToolsMode ? TOOL_CATEGORY : ORG_CATEGORY;

      console.log("Mode:", isToolsMode ? "Tools" : "Org");
      console.log("Category:", category);
      console.log("Query:", query);
      // THE USER AND CATEGORY VARIABLES ARE THE SAME IN THIS APP
      const res = await fetch(`${API_URL}/process/${category}/${userID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify({"query": query }),
      });

      if (res.ok) {
        const data = await res.json();
        // console.log("AI API response:", data);
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

    // Decrement usageCount for temp users
    if (session?.user?.isTempUser && session.user.id) {
      const updated = await prisma.tempUser.update({
        where: { id: session.user.id },
        data: { usageCount: { decrement: 1 } },
      });
      if (updated.usageCount < 0) {
        await prisma.tempUser.delete({ where: { id: session.user.id } });
      }
    }

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
