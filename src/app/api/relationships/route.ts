import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { sourceId, targetId, label } = await request.json();

    if (!sourceId || !targetId || !label) {
      return NextResponse.json(
        { error: "sourceId, targetId, and label are required" },
        { status: 400 }
      );
    }

    const relationship = await prisma.relationship.create({
      data: {
        sourceId,
        targetId,
        label: label.trim(),
      },
    });

    return NextResponse.json({ relationship });
  } catch (error: any) {
    console.error("Error creating relationship:", error);
    return NextResponse.json(
      { error: "Failed to create relationship", details: error.message },
      { status: 500 }
    );
  }
}
