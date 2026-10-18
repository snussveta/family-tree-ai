import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.relationship.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Error deleting relationship:", error);
    return NextResponse.json(
      { error: "Failed to delete relationship", details: error.message },
      { status: 500 }
    );
  }
}
