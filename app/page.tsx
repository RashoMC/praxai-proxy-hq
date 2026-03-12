"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  CircleDollarSign,
  Cpu,
  LoaderCircle,
  ListTodo,
  ScanSearch,
  Send,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

type AgentApi = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  status: string;
  task: string | null;
  queueSize: number;
  lastSeen?: string | null;
};

type TodoItem = {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "DONE";
  agent: string;
  createdAt: string;
  updatedAt: string;
};

type CustomKpiItem = {
  id: string;
  name: string;
  value: string | number | boolean | null | Record<string, unknown> | Array<unknown>;
  change: string | null;
  timestamp: string;
};

type DashboardKpis = {
  overview: {
    totalLeads: number;
    conversionRate: number;
    pipelineValue: number;
  };
  todos: TodoItem[];
  todoSummary: {
    total: number;
    pending: number;
    done: number;
  };
  customKpisByAgent: Array<{
    agent: string;
    items: CustomKpiItem[];
  }>;
};

type TodoUpdateResponse =
  | TodoItem
  | {
      todo: TodoItem;
      notifiedAgent: string;
    };

type AgentBlueprint = {
  name: string;
  accent: string;
  glow: string;
  avatar: string;
  defaultTask: string;
  role: string;
  icon: typeof ScanSearch;
  seat: string;
};

const AGENT_BLUEPRINTS: AgentBlueprint[] = [
  {
    name: "Mark",
    accent: "#f97316",
    glow: "rgba(249, 115, 22, 0.45)",
    avatar: "/agents/mark.jpg",
    defaultTask: "Researching leads",
    role: "Lead Intel",
    icon: ScanSearch,
    seat: "lg:col-span-6 lg:row-span-6",
  },
  {
    name: "Prism",
    accent: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.45)",
    avatar: "/agents/prism.jpg",
    defaultTask: "Drafting messages",
    role: "Outreach Ops",
    icon: Send,
    seat: "lg:col-span-6 lg:row-span-6",
  },
  {
    name: "Crafter",
    accent: "#a855f7",
    glow: "rgba(168, 85, 247, 0.45)",
    avatar: "/agents/crafter.jpg",
    defaultTask: "Building features",
    role: "Product Build",
    icon: Wrench,
    seat: "lg:col-span-6 lg:row-span-6",
  },
  {
    name: "Blox",
    accent: "#22c55e",
    glow: "rgba(34, 197, 94, 0.45)",
    avatar: "/agents/blox.jpg",
    defaultTask: "Managing community",
    role: "Community Desk",
    icon: Sparkles,
    seat: "lg:col-span-6 lg:row-span-6",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatKpiValue(value: CustomKpiItem["value"]) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US").format(value);
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

function getStatusTone(status: string) {
  switch (status) {
    case "WORKING":
      return {
        label: "Working",
        text: "text-emerald-300",
        dot: "bg-emerald-400",
      };
    case "PAUSED":
      return {
        label: "Paused",
        text: "text-rose-300",
        dot: "bg-rose-400",
      };
    default:
      return {
        label: "Idle",
        text: "text-amber-300",
        dot: "bg-amber-400",
      };
  }
}

export default function Dashboard() {
  const [agents, setAgents] = useState<AgentApi[]>([]);
  const [dashboardKpis, setDashboardKpis] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingTodoId, setCompletingTodoId] = useState<string | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<Record<string, string>>({});

  const refreshDashboard = useEffectEvent(async () => {
    try {
      const [agentsRes, kpisRes] = await Promise.all([
        fetch("/api/agents", { cache: "no-store" }),
        fetch("/api/kpis/dashboard", { cache: "no-store" }),
      ]);

      if (!agentsRes.ok || !kpisRes.ok) {
        throw new Error("Dashboard refresh failed");
      }

      const [agentData, kpiData] = await Promise.all([
        agentsRes.json() as Promise<AgentApi[]>,
        kpisRes.json() as Promise<DashboardKpis>,
      ]);

      setAgents(Array.isArray(agentData) ? agentData : []);
      setDashboardKpis(kpiData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    void refreshDashboard();
    const interval = window.setInterval(() => {
      void refreshDashboard();
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const agentsByName = new Map(agents.map((agent) => [agent.name, agent]));
  const officeAgents = AGENT_BLUEPRINTS.map((blueprint) => {
    const liveAgent = agentsByName.get(blueprint.name);
    return {
      ...blueprint,
      id: liveAgent?.id ?? blueprint.name,
      color: liveAgent?.color ?? blueprint.accent,
      status: liveAgent?.status ?? "WORKING",
      task: liveAgent?.task ?? blueprint.defaultTask,
      queueSize: liveAgent?.queueSize ?? 1,
      lastSeen: liveAgent?.lastSeen ?? null,
    };
  });

  const kpiCards = [
    {
      label: "Total Leads",
      value: dashboardKpis ? String(dashboardKpis.overview.totalLeads) : "--",
      icon: Users,
      accent: "#38bdf8",
      note: "Tracked across the full pipeline",
    },
    {
      label: "Conversion Rate",
      value: dashboardKpis ? `${dashboardKpis.overview.conversionRate}%` : "--",
      icon: Activity,
      accent: "#fb7185",
      note: "Closed deals vs. total leads",
    },
    {
      label: "Pipeline Value",
      value: dashboardKpis ? formatCurrency(dashboardKpis.overview.pipelineValue) : "--",
      icon: CircleDollarSign,
      accent: "#22c55e",
      note: "Estimated open pipeline value",
    },
  ];

  const customKpisByAgent = dashboardKpis?.customKpisByAgent ?? [];
  const todos = dashboardKpis?.todos ?? [];
  const pendingTodos = todos.filter((todo) => todo.status === "PENDING");
  const doneTodos = todos.filter((todo) => todo.status === "DONE");

  const handleMarkDone = async (todo: TodoItem) => {
    if (completingTodoId) {
      return;
    }

    const previousDashboard = dashboardKpis;
    const optimisticTodo: TodoItem = {
      ...todo,
      status: "DONE",
      updatedAt: new Date().toISOString(),
    };

    setCompletingTodoId(todo.id);
    setDashboardKpis((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        todos: current.todos.map((item) => (item.id === todo.id ? optimisticTodo : item)),
        todoSummary: {
          ...current.todoSummary,
          pending: Math.max(0, current.todoSummary.pending - 1),
          done: current.todoSummary.done + 1,
        },
      };
    });

    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE", actor: "dashboard" }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete todo");
      }

      const data = await response.json() as TodoUpdateResponse;
      const updatedTodo = "todo" in data ? data.todo : data;
      const notifiedAgent = "todo" in data ? data.notifiedAgent : updatedTodo.agent;

      setDashboardKpis((current) => {
        if (!current) {
          return current;
        }

        const nextTodos = current.todos
          .map((item) => (item.id === updatedTodo.id ? updatedTodo : item))
          .sort((a, b) => {
            if (a.status !== b.status) {
              return a.status.localeCompare(b.status);
            }

            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });

        return {
          ...current,
          todos: nextTodos,
        };
      });

      setRecentNotifications((current) => ({ ...current, [updatedTodo.id]: notifiedAgent }));
      window.setTimeout(() => {
        setRecentNotifications((current) => {
          const next = { ...current };
          delete next[updatedTodo.id];
          return next;
        });
      }, 5000);

      toast.success(`Notified ${notifiedAgent}`, {
        description: `"${updatedTodo.title}" moved to Done.`,
      });
    } catch (error) {
      console.error(error);
      setDashboardKpis(previousDashboard);
      toast.error("Failed to complete todo");
    } finally {
      setCompletingTodoId(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.header
        className="relative overflow-hidden rounded-sm border border-cyan-400/20 bg-[#07111f] px-5 py-4 shadow-[0_0_0_1px_rgba(8,145,178,0.1),inset_0_0_40px_rgba(8,145,178,0.08)]"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.08)_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-300/70">
              Retro Command Center
            </p>
            <h1
              className="text-2xl font-bold text-cyan-300 md:text-3xl"
              style={{
                fontFamily: "var(--font-pixelify)",
                textShadow: "0 0 18px rgba(34, 211, 238, 0.55)",
              }}
            >
              {"// PROXY HQ"}
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-300 md:text-right">
            <span className="rounded-sm border border-cyan-400/20 bg-cyan-400/5 px-3 py-2">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="rounded-sm border border-emerald-400/20 bg-emerald-400/5 px-3 py-2">
              4 stations online
            </span>
          </div>
        </div>
      </motion.header>

      <section className="grid gap-3 md:grid-cols-3">
        {kpiCards.map(({ label, value, icon: Icon, accent, note }, index) => (
          <motion.div
            key={label}
            className="relative overflow-hidden rounded-sm border bg-[#0b1627] p-4"
            style={{
              borderColor: `${accent}44`,
              boxShadow: `0 0 0 1px ${accent}1f, inset 0 0 24px ${accent}12`,
            }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.07 }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
            />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  {label}
                </p>
                <div
                  className={`mt-3 text-3xl font-bold ${loading ? "animate-pulse" : ""}`}
                  style={{
                    color: accent,
                    fontFamily: "var(--font-pixelify)",
                    textShadow: `0 0 16px ${accent}55`,
                  }}
                >
                  {value}
                </div>
                <p className="mt-2 text-xs text-slate-500">{note}</p>
              </div>
              <div
                className="rounded-sm border p-2"
                style={{
                  borderColor: `${accent}40`,
                  backgroundColor: `${accent}14`,
                }}
              >
                <Icon size={18} style={{ color: accent }} />
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.section
          className="relative overflow-hidden rounded-sm border border-amber-400/20 bg-[#0b1320] p-4 shadow-[0_0_0_1px_rgba(251,191,36,0.08),inset_0_0_32px_rgba(251,191,36,0.06)]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-300/70">
                Ras Inbox
              </p>
              <h2
                className="mt-1 text-xl font-bold text-amber-200"
                style={{ fontFamily: "var(--font-pixelify)" }}
              >
                Agent Todo Queue
              </h2>
            </div>
            <div className="rounded-sm border border-amber-400/20 bg-amber-400/8 px-3 py-2 font-mono text-[11px] text-amber-100">
              {dashboardKpis ? `${dashboardKpis.todoSummary.pending} pending / ${dashboardKpis.todoSummary.done} done` : "Loading"}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {todos.length > 0 ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/70">
                      Pending
                    </p>
                    <span className="text-xs text-slate-500">{pendingTodos.length} open</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {pendingTodos.map((todo) => (
                      <motion.article
                        key={todo.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: completingTodoId === todo.id ? 0.98 : 1,
                        }}
                        exit={{ opacity: 0, x: -24, scale: 0.96 }}
                        className="rounded-sm border border-slate-800 bg-slate-950/40 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <ListTodo size={15} className="text-amber-300" />
                              <h3 className="text-sm font-semibold text-slate-100">{todo.title}</h3>
                            </div>
                            {todo.description ? (
                              <p className="mt-2 text-sm leading-6 text-slate-400">{todo.description}</p>
                            ) : null}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="rounded-sm border border-cyan-400/20 bg-cyan-400/8 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-200">
                              {todo.agent}
                            </span>
                            <span className="rounded-sm border border-slate-700 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">
                              {todo.priority}
                            </span>
                            <button
                              type="button"
                              onClick={() => void handleMarkDone(todo)}
                              disabled={completingTodoId !== null}
                              className="inline-flex items-center gap-1 rounded-sm border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {completingTodoId === todo.id ? (
                                <>
                                  <LoaderCircle size={12} className="animate-spin" />
                                  Completing
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={12} />
                                  Mark Done
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>
                  {pendingTodos.length === 0 ? (
                    <div className="rounded-sm border border-dashed border-slate-700 px-4 py-6 text-sm text-slate-500">
                      No pending todos.
                    </div>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-300/70">
                      Done
                    </p>
                    <span className="text-xs text-slate-500">{doneTodos.length} completed</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {doneTodos.map((todo) => (
                      <motion.article
                        key={todo.id}
                        layout
                        initial={{ opacity: 0, x: 24, scale: 0.96 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        className="rounded-sm border border-emerald-500/20 bg-emerald-500/5 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={15} className="text-emerald-400" />
                              <h3 className="text-sm font-semibold text-slate-100">{todo.title}</h3>
                            </div>
                            {todo.description ? (
                              <p className="mt-2 text-sm leading-6 text-slate-400">{todo.description}</p>
                            ) : null}
                            {recentNotifications[todo.id] ? (
                              <p className="mt-2 text-xs font-mono uppercase tracking-[0.22em] text-emerald-300">
                                {`Notified ${recentNotifications[todo.id]}`}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="rounded-sm border border-cyan-400/20 bg-cyan-400/8 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-200">
                              {todo.agent}
                            </span>
                            <span className="rounded-sm border border-slate-700 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">
                              {todo.priority}
                            </span>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>
                  {doneTodos.length === 0 ? (
                    <div className="rounded-sm border border-dashed border-slate-700 px-4 py-6 text-sm text-slate-500">
                      Completed todos will land here.
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="rounded-sm border border-dashed border-slate-700 px-4 py-6 text-sm text-slate-500 lg:col-span-2">
                No agent todos reported.
              </div>
            )}
          </div>
        </motion.section>

        <motion.section
          className="relative overflow-hidden rounded-sm border border-emerald-400/20 bg-[#08131f] p-4 shadow-[0_0_0_1px_rgba(74,222,128,0.08),inset_0_0_32px_rgba(74,222,128,0.06)]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18 }}
        >
          <div className="mb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-emerald-300/70">
              Agent Telemetry
            </p>
            <h2
              className="mt-1 text-xl font-bold text-emerald-200"
              style={{ fontFamily: "var(--font-pixelify)" }}
            >
              Custom KPI Cards
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {customKpisByAgent.length > 0 ? (
              customKpisByAgent.map((agentKpi) => {
                const agentAccent =
                  AGENT_BLUEPRINTS.find((agent) => agent.name === agentKpi.agent)?.accent ?? "#38bdf8";

                return (
                  <article
                    key={agentKpi.agent}
                    className="rounded-sm border bg-slate-950/35 p-3"
                    style={{ borderColor: `${agentAccent}33` }}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3
                        className="text-lg font-bold"
                        style={{
                          color: agentAccent,
                          fontFamily: "var(--font-pixelify)",
                        }}
                      >
                        {agentKpi.agent}
                      </h3>
                      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
                        Latest
                      </span>
                    </div>
                    <div className="space-y-2">
                      {agentKpi.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-sm border border-slate-800 bg-[#0b1627] px-3 py-2"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
                              {item.name}
                            </span>
                            {item.change ? (
                              <span className="text-xs text-emerald-300">{item.change}</span>
                            ) : null}
                          </div>
                          <div className="mt-2 text-2xl font-bold text-slate-100">
                            {formatKpiValue(item.value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-sm border border-dashed border-slate-700 px-4 py-6 text-sm text-slate-500 sm:col-span-2">
                No custom KPI reports yet.
              </div>
            )}
          </div>
        </motion.section>
      </section>

      <motion.section
        className="relative overflow-hidden rounded-sm border border-slate-800 bg-[#050b14] p-4 shadow-[inset_0_0_80px_rgba(2,6,23,0.95)] md:p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_35%),linear-gradient(rgba(15,23,42,0.85),rgba(2,6,23,0.98))]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(51,65,85,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(51,65,85,0.2)_1px,transparent_1px)] bg-[size:26px_26px] opacity-40" />
        <div className="relative mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-slate-500">
              Star Office Grid
            </p>
            <h2
              className="text-xl font-bold text-slate-100"
              style={{ fontFamily: "var(--font-pixelify)" }}
            >
              Agent Floor
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span className="rounded-sm border border-cyan-400/20 bg-cyan-400/5 px-2 py-1">
              Live poll: 5s
            </span>
            <span className="rounded-sm border border-slate-700 px-2 py-1">
              Neon office mode
            </span>
          </div>
        </div>

        <div className="relative grid gap-4 lg:grid-cols-12">
          {officeAgents.map((agent, index) => {
            const statusTone = getStatusTone(agent.status);
            const AgentIcon = agent.icon;

            return (
              <motion.article
                key={agent.name}
                className={`relative overflow-hidden rounded-sm border bg-[#0a1422] p-4 ${agent.seat}`}
                style={{
                  borderColor: `${agent.accent}44`,
                  boxShadow: `inset 0 0 0 1px ${agent.accent}15, 0 12px 30px rgba(2, 6, 23, 0.32)`,
                }}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.28, delay: 0.08 * index }}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${agent.accent}, transparent)`,
                  }}
                />
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="relative h-14 w-14 overflow-hidden rounded-sm border"
                      style={{
                        borderColor: `${agent.accent}66`,
                        boxShadow: `0 0 18px ${agent.glow}`,
                      }}
                    >
                      <Image
                        src={agent.avatar}
                        alt={agent.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className="truncate text-lg font-bold"
                          style={{
                            color: agent.accent,
                            fontFamily: "var(--font-pixelify)",
                            textShadow: `0 0 16px ${agent.glow}`,
                          }}
                        >
                          {agent.name}
                        </h3>
                        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
                          {agent.role}
                        </span>
                      </div>
                      <div className={`mt-1 flex items-center gap-2 text-xs font-mono ${statusTone.text}`}>
                        <span className={`h-2 w-2 rounded-full ${statusTone.dot} animate-pulse`} />
                        {statusTone.label}
                      </div>
                    </div>
                  </div>
                  <div
                    className="rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.25em]"
                    style={{
                      borderColor: `${agent.accent}36`,
                      color: agent.accent,
                      backgroundColor: `${agent.accent}12`,
                    }}
                  >
                    q:{agent.queueSize}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px]">
                  <div className="space-y-3">
                    <div className="rounded-sm border border-slate-800 bg-slate-950/40 p-3">
                      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
                        <AgentIcon size={12} />
                        Current Task
                      </div>
                      <p className="text-sm leading-6 text-slate-200">{agent.task}</p>
                    </div>

                    <div className="flex items-center gap-3 rounded-sm border border-slate-800 bg-slate-950/30 px-3 py-2">
                      <Cpu size={14} style={{ color: agent.accent }} />
                      <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-400">
                        {agent.status === 'WORKING' ? 'Working' : agent.status === 'PAUSED' ? 'Paused' : 'Idle'}
                      </span>
                      {agent.status === 'WORKING' && (
                        <div className="flex items-center gap-1">
                          {[0, 1, 2].map((dot) => (
                            <motion.span
                              key={dot}
                              className="block h-1.5 w-1.5 rounded-none"
                              style={{ backgroundColor: agent.accent }}
                              animate={{ opacity: [0.25, 1, 0.25] }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: dot * 0.18,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="rounded-sm border border-slate-800 bg-[#09101c] p-3">
                      <motion.div
                        className="relative mx-auto h-24 w-full max-w-[140px] rounded-sm border-2 bg-[#0b1626]"
                        style={{
                          borderColor: `${agent.accent}90`,
                          boxShadow: `0 0 0 1px ${agent.accent}22, 0 0 26px ${agent.glow}`,
                        }}
                        animate={{
                          boxShadow: [
                            `0 0 0 1px ${agent.accent}22, 0 0 18px ${agent.glow}`,
                            `0 0 0 1px ${agent.accent}44, 0 0 34px ${agent.glow}`,
                            `0 0 0 1px ${agent.accent}22, 0 0 18px ${agent.glow}`,
                          ],
                        }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <div
                          className="absolute inset-2 rounded-[2px]"
                          style={{
                            background: `linear-gradient(180deg, ${agent.accent}40 0%, rgba(15, 23, 42, 0.15) 100%)`,
                          }}
                        />
                        <div className="absolute inset-x-3 top-4 h-1 bg-slate-900/60" />
                        <div className="absolute left-3 top-8 h-2 w-12 bg-slate-900/70" />
                        <div className="absolute right-3 top-8 h-2 w-8" style={{ backgroundColor: `${agent.accent}88` }} />
                        <div className="absolute inset-x-3 bottom-4 h-6 border border-slate-900/70 bg-slate-950/45" />
                      </motion.div>
                      <div className="mx-auto h-3 w-10 rounded-b-sm bg-slate-700/80" />
                      <div className="mx-auto h-10 w-full max-w-[150px] rounded-sm border border-slate-800 bg-[#0d1727]">
                        <div className="grid h-full grid-cols-6 gap-px p-1">
                          {Array.from({ length: 18 }).map((_, key) => (
                            <div
                              key={key}
                              className="rounded-[1px] bg-slate-800"
                              style={{
                                backgroundColor: key % 5 === 0 ? `${agent.accent}55` : undefined,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
