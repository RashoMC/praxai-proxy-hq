import { NextRequest, NextResponse } from "next/server";
import { completeTodo } from "@/lib/todo-completion";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const result = await completeTodo(id, {
      actor: typeof body.actor === "string" ? body.actor : "dashboard",
      source: "post:/api/todos/[id]/complete",
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "TODO_NOT_FOUND") {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    console.error("Error completing todo:", error);
    return NextResponse.json({ error: "Failed to complete todo" }, { status: 500 });
  }
}
