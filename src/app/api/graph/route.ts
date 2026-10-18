import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [personsRaw, relationships] = await Promise.all([
      prisma.person.findMany({
        orderBy: { createdAt: "asc" },
      }),
      prisma.relationship.findMany({
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const persons = personsRaw.map((p) => {
      let hobbies: string[] = [];
      let preferences: string[] = [];
      try {
        hobbies = JSON.parse(p.hobbies || "[]");
      } catch {
        hobbies = p.hobbies ? [p.hobbies] : [];
      }
      try {
        preferences = JSON.parse(p.preferences || "[]");
      } catch {
        preferences = p.preferences ? [p.preferences] : [];
      }

      return {
        ...p,
        birthDate: p.birthDate ? p.birthDate.toISOString() : null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        hobbies,
        preferences,
      };
    });

    return NextResponse.json({
      persons,
      relationships,
    });
  } catch (error: any) {
    console.error("Error in GET /api/graph:", error);
    return NextResponse.json(
      { error: "Failed to fetch graph data", details: error.message },
      { status: 500 }
    );
  }
}
