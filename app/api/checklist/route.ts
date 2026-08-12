import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

function isMissingRecord(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2025"
  );
}

export async function POST(request: Request) {
  try {
    const { school_id, title } = await request.json();

    if (typeof school_id !== "string" || !school_id) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 }
      );
    }

    const trimmed = typeof title === "string" ? title.trim() : "";
    if (!trimmed) {
      return NextResponse.json({ error: "A title is required" }, { status: 400 });
    }

    const school = await prisma.schools.findUnique({
      where: { id: school_id },
      select: { id: true },
    });
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    // New items land at the bottom of the list.
    const last = await prisma.checklistItem.findFirst({
      where: { school_id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const item = await prisma.checklistItem.create({
      data: {
        school_id,
        title: trimmed,
        order: last ? last.order + 1 : 0,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating checklist item:", error);
    return NextResponse.json(
      { error: "Failed to create checklist item" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (typeof id !== "string" || !id) {
      return NextResponse.json(
        { error: "Checklist item ID is required" },
        { status: 400 }
      );
    }

    const data: { done?: boolean; title?: string; order?: number } = {};

    if ("done" in body) {
      if (typeof body.done !== "boolean") {
        return NextResponse.json(
          { error: "done must be a boolean" },
          { status: 400 }
        );
      }
      data.done = body.done;
    }

    if ("title" in body) {
      const trimmed = typeof body.title === "string" ? body.title.trim() : "";
      if (!trimmed) {
        return NextResponse.json(
          { error: "A title is required" },
          { status: 400 }
        );
      }
      data.title = trimmed;
    }

    if ("order" in body) {
      if (!Number.isInteger(body.order)) {
        return NextResponse.json(
          { error: "order must be a whole number" },
          { status: 400 }
        );
      }
      data.order = body.order;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    const item = await prisma.checklistItem.update({ where: { id }, data });
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating checklist item:", error);

    if (isMissingRecord(error)) {
      return NextResponse.json(
        { error: "Checklist item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update checklist item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (typeof id !== "string" || !id) {
      return NextResponse.json(
        { error: "Checklist item ID is required" },
        { status: 400 }
      );
    }

    const item = await prisma.checklistItem.delete({ where: { id } });
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error deleting checklist item:", error);

    if (isMissingRecord(error)) {
      return NextResponse.json(
        { error: "Checklist item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete checklist item" },
      { status: 500 }
    );
  }
}
