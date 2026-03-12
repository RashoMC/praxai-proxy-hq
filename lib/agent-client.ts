import { getTodayDueDate } from "@/lib/todo-dates";

export type CreateTodoInput = {
  title: string;
  agent: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: "PENDING" | "DONE";
  dueDate?: string;
};

export type AgentClientOptions = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

export async function createTodo(
  input: CreateTodoInput,
  options: AgentClientOptions = {}
) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const baseUrl = options.baseUrl ?? process.env.PRAXAI_PROXY_HQ_URL ?? "http://localhost:3000";

  const response = await fetchImpl(`${baseUrl}/api/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: input.title,
      description: input.description,
      priority: input.priority ?? "MEDIUM",
      status: input.status ?? "PENDING",
      agent: input.agent,
      dueDate: input.dueDate ?? getTodayDueDate().toISOString(),
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload && typeof payload.error === "string" ? payload.error : "Failed to create todo";

    throw new Error(message);
  }

  return response.json() as Promise<{
    id: string;
    title: string;
    description: string | null;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: "PENDING" | "DONE";
    agent: string;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
}
