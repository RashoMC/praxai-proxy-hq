"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Agent {
  id: string;
  name: string;
  emoji: string;
  color: string;
  status: string;
  task: string | null;
  queueSize: number;
}

const statusConfig = {
  WORKING: { dot: "bg-green-400", label: "Working", text: "text-green-400" },
  IDLE: { dot: "bg-amber-400", label: "Idle", text: "text-amber-400" },
  PAUSED: { dot: "bg-red-400", label: "Paused", text: "text-red-400" },
};

export default function AgentOffice() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAgents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-sm p-4">
      <h2 className="text-slate-100 text-base font-bold mb-3 flex items-center gap-2">
        <span>Agent Office</span>
        <span className="text-xs text-slate-400 font-normal">Live Status</span>
      </h2>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-700 animate-pulse rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {agents.map((agent) => {
            const config = statusConfig[agent.status as keyof typeof statusConfig] || statusConfig.IDLE;
            return (
              <div
                key={agent.id}
                className="bg-slate-700/50 border border-slate-600 rounded-sm p-3 hover:border-slate-500 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl flex-shrink-0">{agent.emoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-200">{agent.name}</span>
                        <span className={`flex items-center gap-1 text-xs ${config.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${agent.status === 'WORKING' ? 'animate-pulse' : ''}`} />
                          {config.label}
                        </span>
                      </div>
                      {agent.task ? (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{agent.task}</p>
                      ) : (
                        <p className="text-xs text-slate-500 mt-0.5">No active task</p>
                      )}
                    </div>
                  </div>
                  {agent.queueSize > 0 && (
                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 rounded-sm text-xs flex-shrink-0">
                      {agent.queueSize} queued
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
