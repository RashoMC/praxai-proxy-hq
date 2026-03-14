"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

type TodoItem = {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "DONE";
  agent: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string | null;
};

type DateFilter = "today" | "tomorrow" | "upcoming" | "all";

type TodoUpdateResponse =
  | TodoItem
  | { todo: TodoItem; notifiedAgent: string };

const PRIORITY_LEFT_BORDER: Record<string, string> = {
  HIGH: "border-l-rose-400",
  MEDIUM: "border-l-amber-400",
  LOW: "border-l-slate-600",
};

const AGENT_COLOR: Record<string, string> = {
  Mark: "#f97316",
  Prism: "#38bdf8",
  Crafter: "#a855f7",
  Blox: "#22c55e",
};

const TABS: { id: DateFilter; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "upcoming", label: "Upcoming" },
  { id: "all", label: "All" },
];

export default function DailyTaskView() {
  const [filter, setFilter] = useState<DateFilter>("today");
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const apiFilter = filter === "upcoming" ? "all" : filter;

    fetch(`/api/todos?date=${apiFilter}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: unknown) => {
        if (!Array.isArray(data)) return;
        const items = data as TodoItem[];

        if (filter === "upcoming") {
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          setTodos(
            items.filter((t) => t.dueDate && new Date(t.dueDate) >= todayStart)
          );
        } else {
          setTodos(items);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const handleMarkDone = async (todo: TodoItem) => {
    if (completingId) return;

    const previousTodo = todo;
    setCompletingId(todo.id);
    setTodos((current) =>
      current.map((t) =>
        t.id === todo.id
          ? { ...t, status: "DONE" as const, updatedAt: new Date().toISOString() }
          : t
      )
    );

    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE", actor: "dashboard" }),
      });

      if (!response.ok) throw new Error("Failed to complete todo");

      const data = (await response.json()) as TodoUpdateResponse;
      const updatedTodo = "todo" in data ? data.todo : data;
      const notifiedAgent =
        "todo" in data ? data.notifiedAgent : updatedTodo.agent;

      setTodos((current) =>
        current.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
      );

      toast.success(`Notified ${notifiedAgent}`, {
        description: `"${updatedTodo.title}" moved to Done.`,
      });
    } catch {
      setTodos((current) =>
        current.map((t) => (t.id === todo.id ? previousTodo : t))
      );
      toast.error("Failed to complete todo");
    } finally {
      setCompletingId(null);
    }
  };

  const pendingTodos = todos.filter((t) => t.status === "PENDING");
  const doneTodos = todos.filter((t) => t.status === "DONE");

  return (
    <motion.section
      className="relative overflow-hidden rounded-sm border border-amber-400/20 bg-[#0b1320] p-4 shadow-[0_0_0_1px_rgba(251,191,36,0.08),inset_0_0_32px_rgba(251,191,36,0.06)]"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.12 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.04)_1px,transparent_1px)] bg-[size:20px_20px]" />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-300/70">
              Ras Inbox
            </p>
            <h2
              className="mt-1 text-xl font-bold text-amber-200"
              style={{ fontFamily: "var(--font-pixelify)" }}
            >
              Daily Tasks
            </h2>
          </div>
          <div className="rounded-sm border border-amber-400/20 bg-amber-400/8 px-3 py-2 font-mono text-[11px] text-amber-100">
            {loading ? "Loading..." : `${pendingTodos.length} pending / ${doneTodos.length} done`}
          </div>
        </div>

        {/* Tab selector */}
        <div className="mb-4 flex gap-1 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`rounded-sm border-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] transition ${
                filter === tab.id
                  ? "border-amber-400/40 bg-amber-400/15 text-amber-200"
                  : "border-slate-700 bg-slate-900/40 text-slate-500 hover:border-slate-600 hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-sm border-2 border-slate-800 bg-slate-900/40"
              />
            ))}
          </div>
        ) : todos.length === 0 ? (
          <div className="rounded-sm border-2 border-dashed border-slate-700 px-4 py-6 font-mono text-xs uppercase tracking-[0.2em] text-slate-600">
            No tasks for this period.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/70">
                Pending ({pendingTodos.length})
              </p>
              <AnimatePresence initial={false}>
                {pendingTodos.map((todo) => (
                  <TodoRow
                    key={todo.id}
                    todo={todo}
                    completing={completingId === todo.id}
                    disabled={completingId !== null}
                    onMarkDone={() => void handleMarkDone(todo)}
                  />
                ))}
              </AnimatePresence>
              {pendingTodos.length === 0 ? (
                <div className="rounded-sm border-2 border-dashed border-slate-700 px-4 py-4 font-mono text-xs uppercase tracking-[0.2em] text-slate-600">
                  All done!
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-300/70">
                Done ({doneTodos.length})
              </p>
              <AnimatePresence initial={false}>
                {doneTodos.map((todo) => (
                  <TodoRow key={todo.id} todo={todo} done />
                ))}
              </AnimatePresence>
              {doneTodos.length === 0 ? (
                <div className="rounded-sm border-2 border-dashed border-slate-700 px-4 py-4 font-mono text-xs uppercase tracking-[0.2em] text-slate-600">
                  Completed tasks appear here.
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}

function TodoRow({
  todo,
  done = false,
  completing = false,
  disabled = false,
  onMarkDone,
}: {
  todo: TodoItem;
  done?: boolean;
  completing?: boolean;
  disabled?: boolean;
  onMarkDone?: () => void;
}) {
  const priorityBorder =
    PRIORITY_LEFT_BORDER[todo.priority] ?? PRIORITY_LEFT_BORDER.MEDIUM;
  const agentColor = AGENT_COLOR[todo.agent] ?? "#38bdf8";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.96 }}
      className={`rounded-sm border-2 border-l-4 p-3 transition ${priorityBorder} ${
        done
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-slate-800 bg-slate-950/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          {/* Pixel checkbox */}
          <div
            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-2 ${
              done
                ? "border-emerald-400/60 bg-emerald-400/20"
                : "border-slate-600 bg-slate-900"
            }`}
          >
            {done ? <CheckCircle2 size={10} className="text-emerald-400" /> : null}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={`break-words text-sm font-bold leading-5 ${
                done ? "text-slate-500 line-through" : "text-slate-100"
              }`}
              style={{ fontFamily: "var(--font-pixelify)" }}
            >
              {todo.title}
            </p>
            {todo.description ? (
              <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                {todo.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {/* Agent badge */}
          <span
            className="rounded-sm border-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{
              borderColor: `${agentColor}44`,
              color: agentColor,
              backgroundColor: `${agentColor}18`,
            }}
          >
            {todo.agent.charAt(0)}
          </span>

          {!done && onMarkDone ? (
            <button
              type="button"
              onClick={onMarkDone}
              disabled={disabled}
              className="inline-flex items-center gap-1 rounded-sm border-2 border-emerald-400/30 bg-emerald-400/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {completing ? (
                <LoaderCircle size={11} className="animate-spin" />
              ) : (
                <CheckCircle2 size={11} />
              )}
              Done
            </button>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
