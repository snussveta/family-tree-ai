import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, relation, birthDate, hobbies, preferences, notes, avatarUrl, targetPersonId, relationshipLabel } = body;

    if (!name || !relation) {
      return NextResponse.json(
        { error: "Name and relation are required" },
        { status: 400 }
      );
    }

    const hobbiesArray = Array.isArray(hobbies)
      ? hobbies
      : typeof hobbies === "string"
      ? hobbies.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const preferencesArray = Array.isArray(preferences)
      ? preferences
      : typeof preferences === "string"
      ? preferences.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const newPerson = await prisma.person.create({
      data: {
        name: name.trim(),
        relation: relation.trim(),
        birthDate: birthDate ? new Date(birthDate) : null,
        hobbies: JSON.stringify(hobbiesArray),
        preferences: JSON.stringify(preferencesArray),
        notes: notes?.trim() || null,
        avatarUrl: avatarUrl?.trim() || null,
      },
    });

    // If targetPersonId is given, link them
    if (targetPersonId) {
      await prisma.relationship.create({
        data: {
          sourceId: newPerson.id,
          targetId: targetPersonId,
          label: relationshipLabel || relation,
        },
      });
    }

    return NextResponse.json({
      person: {
        ...newPerson,
        hobbies: hobbiesArray,
        preferences: preferencesArray,
      },
    });
  } catch (error: any) {
    console.error("Error creating person:", error);
    return NextResponse.json(
      { error: "Failed to create person", details: error.message },
      { status: 500 }
    );
  }
}
