import prisma from "@/lib/prisma";

type CompletionOptions = {
  actor?: string;
  source?: string;
};

export async function completeTodo(todoId: string, options: CompletionOptions = {}) {
  return prisma.$transaction(async (tx) => {
    const existingTodo = await tx.todo.findUnique({
      where: { id: todoId },
    });

    if (!existingTodo) {
      throw new Error("TODO_NOT_FOUND");
    }

    const todo = existingTodo.status === "DONE"
      ? existingTodo
      : await tx.todo.update({
          where: { id: todoId },
          data: { status: "DONE" },
        });

    const metadata = {
      actor: options.actor ?? "system",
      source: options.source ?? "api",
      previousStatus: existingTodo.status,
      nextStatus: "DONE",
    };

    const activityNote = existingTodo.status === "DONE"
      ? `Todo completion re-confirmed for ${existingTodo.agent}`
      : `Todo marked done and ${existingTodo.agent} notified`;

    await tx.todoActivity.create({
      data: {
        todoId,
        type: "TODO_COMPLETED",
        note: activityNote,
        metadata,
      },
    });

    const notification = await tx.todoNotification.create({
      data: {
        todoId,
        agent: existingTodo.agent,
        title: "Todo completed",
        message: `${existingTodo.title} was marked done.`,
      },
    });

    return {
      todo,
      notification,
      notifiedAgent: existingTodo.agent,
    };
  });
}
