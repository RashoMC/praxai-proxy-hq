import { NextRequest, NextResponse } from "next/server";
import { Prisma, TodoPriority, TodoStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  getTodoDateWhereClause,
  isTodoDateFilter,
  parseTodoDateFilter,
  parseTodoDueDate,
} from "@/lib/todo-dates";

function isTodoPriority(value: unknown): value is TodoPriority {
  return typeof value === "string" && Object.values(TodoPriority).includes(value as TodoPriority);
}

function isTodoStatus(value: unknown): value is TodoStatus {
  return typeof value === "string" && Object.values(TodoStatus).includes(value as TodoStatus);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const agent = searchParams.get("agent");
    const rawDateFilter = searchParams.get("date");

    if (rawDateFilter !== null && !isTodoDateFilter(rawDateFilter)) {
      return NextResponse.json({ error: "date must be today, tomorrow, or all" }, { status: 400 });
    }

    const dateFilter = parseTodoDateFilter(rawDateFilter);

    const where: Prisma.TodoWhereInput = {
      ...getTodoDateWhereClause(dateFilter),
    };

    if (status) {
      if (!isTodoStatus(status)) {
        return NextResponse.json({ error: "Invalid todo status filter" }, { status: 400 });
      }
      where.status = status;
    }

    if (agent) {
      where.agent = agent;
    }

    const todos = await prisma.todo.findMany({
      where,
      orderBy: [
        { status: "asc" },
        { dueDate: "asc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (typeof body.title !== "string" || body.title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!isTodoPriority(body.priority)) {
      return NextResponse.json({ error: "Priority must be LOW, MEDIUM, or HIGH" }, { status: 400 });
    }

    if (!isTodoStatus(body.status)) {
      return NextResponse.json({ error: "Status must be PENDING or DONE" }, { status: 400 });
    }

    if (typeof body.agent !== "string" || body.agent.trim().length === 0) {
      return NextResponse.json({ error: "Agent is required" }, { status: 400 });
    }

    const dueDate = parseTodoDueDate(body.dueDate);
    if (body.dueDate !== undefined && dueDate === undefined) {
      return NextResponse.json(
        { error: "dueDate must be a valid ISO datetime or date string" },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({
      data: {
        title: body.title.trim(),
        description: typeof body.description === "string" && body.description.trim().length > 0
          ? body.description.trim()
          : null,
        priority: body.priority,
        status: body.status,
        agent: body.agent.trim(),
        dueDate,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.json({ error: "Failed to create todo" }, { status: 500 });
  }
}
