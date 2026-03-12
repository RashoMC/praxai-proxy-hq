import { NextRequest, NextResponse } from "next/server";
import { TodoStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

function isTodoStatus(value: unknown): value is TodoStatus {
  return typeof value === "string" && Object.values(TodoStatus).includes(value as TodoStatus);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!isTodoStatus(body.status)) {
      return NextResponse.json({ error: "Status must be PENDING or DONE" }, { status: 400 });
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: { status: body.status },
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Error updating todo:", error);
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.todo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 });
  }
}
