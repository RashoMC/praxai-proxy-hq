"use client";

import { useEffect, useState, useCallback } from "react";

interface Agent {
  id: string;
  name: string;
  emoji: string;
  color: string;
  status: string;
  task: string | null;
  queueSize: number;
  lastSeen: string | null;
  updatedAt: string;
}

const AGENT_CONFIGS: Record<
  string,
  { desk: string; sprite: string[]; accentClass: string; borderClass: string }
> = {
  Mark: {
    desk: "ANALYTICS DESK",
    accentClass: "text-cyan-400",
    borderClass: "border-cyan-500/40",
    sprite: [
      "░░▓▓▓░░",
      "░▓█▓█▓░",
      "░░▓▓▓░░",
      "░▓▓█▓▓░",
      "░▓░░░▓░",
    ],
  },
  Prism: {
    desk: "OUTREACH DESK",
    accentClass: "text-violet-400",
    borderClass: "border-violet-500/40",
    sprite: [
      "░░▓▓▓░░",
      "░▓░▓░▓░",
      "░░▓▓▓░░",
      "░▓▓█▓▓░",
      "░░▓░▓░░",
    ],
  },
  Crafter: {
    desk: "BUILD DESK",
    accentClass: "text-emerald-400",
    borderClass: "border-emerald-500/40",
    sprite: [
      "░░▓▓▓░░",
      "░▓▓░▓▓░",
      "░░▓▓▓░░",
      "▓▓▓█▓▓▓",
      "░░▓░▓░░",
    ],
  },
};

const STATUS_CONFIG = {
  WORKING: {
    label: "WORKING",
    dot: "bg-green-400",
    text: "text-green-400",
    glow: "shadow-[0_0_8px_rgba(74,222,128,0.6)]",
    blink: true,
  },
  IDLE: {
    label: "IDLE",
    dot: "bg-amber-400",
    text: "text-amber-400",
    glow: "shadow-[0_0_8px_rgba(251,191,36,0.4)]",
    blink: false,
  },
  PAUSED: {
    label: "PAUSED",
    dot: "bg-red-500",
    text: "text-red-400",
    glow: "shadow-[0_0_8px_rgba(239,68,68,0.4)]",
    blink: false,
  },
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function AgentSprite({ name, status }: { name: string; status: string }) {
  const config = AGENT_CONFIGS[name];
  const isWorking = status === "WORKING";
  if (!config) return <span className="text-3xl">{name[0]}</span>;
  return (
    <div
      className={`font-mono text-[10px] leading-[1.2] select-none ${isWorking ? "animate-pulse" : ""}`}
    >
      {config.sprite.map((row, i) => (
        <div key={i} className={config.accentClass}>
          {row}
        </div>
      ))}
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const statusCfg =
    STATUS_CONFIG[agent.status as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG.IDLE;
  const agentCfg = AGENT_CONFIGS[agent.name] || {
    desk: "DESK",
    accentClass: "text-slate-400",
    borderClass: "border-slate-500/40",
  };

  return (
    <div
      className={`relative bg-black border-2 ${agentCfg.borderClass} p-0 font-mono`}
    >
      {/* Title bar */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 border-b border-current ${agentCfg.borderClass} bg-slate-900/80`}
      >
        <span className={`text-[10px] tracking-widest font-bold ${agentCfg.accentClass}`}>
          ▸ {agentCfg.desk}
        </span>
        <span className={`text-[10px] ${statusCfg.text} flex items-center gap-1`}>
          <span
            className={`inline-block w-2 h-2 rounded-none ${statusCfg.dot} ${statusCfg.blink ? "animate-pulse" : ""}`}
          />
          {statusCfg.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Sprite + name */}
        <div className="flex items-end gap-4">
          <AgentSprite name={agent.name} status={agent.status} />
          <div>
            <div className={`text-xl font-bold ${agentCfg.accentClass} tracking-wider`}>
              {agent.emoji} {agent.name.toUpperCase()}
            </div>
            <div className="text-slate-500 text-[10px] tracking-widest">
              AGENT ID: {agent.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Task */}
        <div className="border border-slate-700 bg-slate-900/50 p-2">
          <div className="text-slate-500 text-[9px] tracking-widest mb-1">
            CURRENT TASK
          </div>
          {agent.task ? (
            <div className="text-green-300 text-xs leading-relaxed">
              <span className="text-green-500">▸ </span>
              {agent.task}
            </div>
          ) : (
            <div className="text-slate-600 text-xs italic">
              — awaiting orders —
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-slate-700 bg-slate-900/50 p-2">
            <div className="text-slate-500 text-[9px] tracking-widest">
              QUEUE
            </div>
            <div className={`text-lg font-bold ${agentCfg.accentClass}`}>
              {agent.queueSize.toString().padStart(2, "0")}
            </div>
          </div>
          <div className="border border-slate-700 bg-slate-900/50 p-2">
            <div className="text-slate-500 text-[9px] tracking-widest">
              LAST PING
            </div>
            <div className="text-xs text-slate-400">
              {timeAgo(agent.lastSeen)}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.5) 2px, rgba(0,255,0,0.5) 4px)",
        }}
      />
    </div>
  );
}

function ActivityLog({ agents }: { agents: Agent[] }) {
  const logs: { time: string; msg: string; agent: string }[] = [];
  agents.forEach((a) => {
    if (a.lastSeen) {
      logs.push({
        time: timeAgo(a.lastSeen),
        msg: `${a.status === "WORKING" ? "running task" : a.status.toLowerCase()} — ${a.task ? a.task.slice(0, 40) + (a.task.length > 40 ? "…" : "") : "no task"}`,
        agent: a.name,
      });
    }
  });
  logs.sort(
    (a, b) =>
      new Date(agents.find((x) => x.name === a.agent)?.lastSeen ?? 0).getTime() -
      new Date(agents.find((x) => x.name === b.agent)?.lastSeen ?? 0).getTime()
  );

  return (
    <div className="border border-green-900/40 bg-black font-mono p-4">
      <div className="text-green-500 text-[10px] tracking-widest mb-3">
        ▸ ACTIVITY LOG
      </div>
      {logs.length === 0 ? (
        <div className="text-slate-600 text-xs">no recent activity</div>
      ) : (
        <div className="space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 text-xs">
              <span className="text-slate-600 w-12 flex-shrink-0">
                {log.time}
              </span>
              <span className="text-green-600">
                [{log.agent.toUpperCase()}]
              </span>
              <span className="text-green-400/70">{log.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [refreshCountdown, setRefreshCountdown] = useState(10);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      if (Array.isArray(data)) setAgents(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 10000);
    return () => clearInterval(interval);
  }, [fetchAgents]);

  // Blinking cursor tick
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 500);
    return () => clearInterval(t);
  }, []);

  // Countdown display
  useEffect(() => {
    const t = setInterval(() => {
      setRefreshCountdown((n) => (n <= 1 ? 10 : n - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const workingCount = agents.filter((a) => a.status === "WORKING").length;
  const cursor = tick % 2 === 0 ? "█" : " ";

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4 md:p-8">
      {/* CRT scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)",
        }}
      />

      {/* Header */}
      <div className="border-2 border-green-500/40 bg-black mb-6">
        <div className="border-b border-green-500/20 px-4 py-2 flex items-center justify-between bg-green-950/20">
          <div className="flex items-center gap-3">
            <span className="text-green-400 text-[10px] tracking-widest">
              ████████╗ PRAXAI COMMAND CENTER v2.0 {cursor}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="text-green-600">
              REFRESH IN {refreshCountdown.toString().padStart(2, "0")}s
            </span>
            <span
              className={`${workingCount > 0 ? "text-green-400" : "text-slate-500"}`}
            >
              {workingCount > 0 ? "● ONLINE" : "○ STANDBY"}
            </span>
          </div>
        </div>
        <div className="px-4 py-3 grid grid-cols-3 gap-4 text-[10px]">
          <div>
            <span className="text-slate-600">AGENTS ONLINE</span>
            <br />
            <span className="text-green-400 text-lg font-bold">
              {agents.length.toString().padStart(2, "0")}
            </span>
          </div>
          <div>
            <span className="text-slate-600">ACTIVE TASKS</span>
            <br />
            <span className="text-green-400 text-lg font-bold">
              {workingCount.toString().padStart(2, "0")}
            </span>
          </div>
          <div>
            <span className="text-slate-600">TOTAL QUEUED</span>
            <br />
            <span className="text-green-400 text-lg font-bold">
              {agents
                .reduce((sum, a) => sum + a.queueSize, 0)
                .toString()
                .padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* MAP GRID */}
      <div className="border border-green-900/30 p-1 mb-6 bg-black">
        <div className="border border-green-900/20 p-3">
          <div className="text-[9px] text-slate-600 tracking-widest mb-3">
            ▸ AGENT FLOOR MAP — SECTOR 7
          </div>

          {/* Floor layout */}
          <div className="border border-slate-800 bg-slate-950 p-3 mb-3 text-[10px] text-slate-700 font-mono leading-5 overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────┐
│  PRAXAI PROXY HQ — OPERATIONS FLOOR                                 │
│                                                                     │
│  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐         │
│  │  ANALYTICS    │   │   OUTREACH    │   │    BUILD      │         │
│  │     DESK      │   │     DESK      │   │     DESK      │         │
│  │               │   │               │   │               │         │
│  │  📈 MARK      │   │  🚀 PRISM     │   │  ⚒️  CRAFTER  │         │
│  │               │   │               │   │               │         │
│  └───────────────┘   └───────────────┘   └───────────────┘         │
│                                                                     │
│  ██████████████████████████  SERVER ROOM  ████████████████████████  │
└─────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </div>
      </div>

      {/* Agent cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-2 border-green-900/30 h-64 bg-slate-900/20 animate-pulse"
            />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="border border-red-900/40 p-6 text-center mb-6">
          <div className="text-red-400 text-sm">
            ✗ NO AGENTS FOUND — DATABASE MAY BE EMPTY
          </div>
          <div className="text-slate-600 text-xs mt-2">
            Run: npm run db:seed
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {/* Activity Log */}
      {!loading && agents.length > 0 && <ActivityLog agents={agents} />}

      {/* Footer */}
      <div className="mt-6 border-t border-green-900/20 pt-3 flex justify-between text-[9px] text-slate-700">
        <span>PRAXAI COMMAND CENTER v2.0</span>
        <span>
          POST /api/agents/heartbeat — AGENTS PING TO UPDATE STATUS
        </span>
        <span>{new Date().toISOString().slice(0, 10)}</span>
      </div>
    </div>
  );
}
