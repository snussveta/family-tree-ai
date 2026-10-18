import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, relation, birthDate, hobbies, preferences, notes, avatarUrl } = body;

    const existing = await prisma.person.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    const hobbiesArray = Array.isArray(hobbies)
      ? hobbies
      : typeof hobbies === "string"
      ? hobbies.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;

    const preferencesArray = Array.isArray(preferences)
      ? preferences
      : typeof preferences === "string"
      ? preferences.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;

    const updated = await prisma.person.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(relation !== undefined && { relation: relation.trim() }),
        ...(birthDate !== undefined && {
          birthDate: birthDate ? new Date(birthDate) : null,
        }),
        ...(hobbiesArray !== undefined && {
          hobbies: JSON.stringify(hobbiesArray),
        }),
        ...(preferencesArray !== undefined && {
          preferences: JSON.stringify(preferencesArray),
        }),
        ...(notes !== undefined && { notes: notes ? notes.trim() : null }),
        ...(avatarUrl !== undefined && {
          avatarUrl: avatarUrl ? avatarUrl.trim() : null,
        }),
      },
    });

    let resHobbies: string[] = [];
    let resPreferences: string[] = [];
    try {
      resHobbies = JSON.parse(updated.hobbies);
    } catch {}
    try {
      resPreferences = JSON.parse(updated.preferences);
    } catch {}

    return NextResponse.json({
      person: {
        ...updated,
        hobbies: resHobbies,
        preferences: resPreferences,
      },
    });
  } catch (error: any) {
    console.error("Error updating person:", error);
    return NextResponse.json(
      { error: "Failed to update person", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.person.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Error deleting person:", error);
    return NextResponse.json(
      { error: "Failed to delete person", details: error.message },
      { status: 500 }
    );
  }
}
