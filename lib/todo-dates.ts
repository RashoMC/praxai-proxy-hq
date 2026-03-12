import { addDays, startOfDay } from "date-fns";
import { Prisma } from "@prisma/client";

export type TodoDateFilter = "today" | "tomorrow" | "all";

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime());
}

export function isTodoDateFilter(value: string | null): value is TodoDateFilter {
  return value === "today" || value === "tomorrow" || value === "all";
}

export function parseTodoDateFilter(value: string | null): TodoDateFilter {
  if (value === "tomorrow" || value === "all") {
    return value;
  }

  return "today";
}

export function getTodoDateWhereClause(filter: TodoDateFilter): Prisma.TodoWhereInput {
  if (filter === "all") {
    return {};
  }

  const baseDate = startOfDay(new Date());
  const targetDate = filter === "tomorrow" ? addDays(baseDate, 1) : baseDate;
  const nextDate = addDays(targetDate, 1);

  return {
    dueDate: {
      gte: targetDate,
      lt: nextDate,
    },
  };
}

export function parseTodoDueDate(value: unknown): Date | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  if (typeof value !== "string" && !(value instanceof Date)) {
    return undefined;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return isValidDate(parsed) ? parsed : undefined;
}

export function getTodayDueDate() {
  return startOfDay(new Date());
}

export function isOverdueDate(dueDate: string | null, now = new Date()) {
  if (!dueDate) {
    return false;
  }

  return new Date(dueDate).toISOString().slice(0, 10) < now.toISOString().slice(0, 10);
}
