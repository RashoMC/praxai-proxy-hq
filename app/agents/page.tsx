"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Agent {
  id: string;
  name: string;
  emoji: string;
  color: string;
  status: string;
  task: string | null;
  queueSize: number;
}

function getStatusColor(status: string) {
  switch (status) {
    case "WORKING": return "#10b981";
    case "IDLE": return "#f59e0b";
    case "PAUSED": return "#ef4444";
    default: return "#64748b";
  }
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const baseUrl = typeof window !== "undefined" 
          ? window.location.origin 
          : "";
        const res = await fetch(`${baseUrl}/api/agents`);
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        
        const data = await res.json();
        setAgents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 font-mono animate-pulse">Loading agents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-400 font-mono">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <h1 className="text-2xl font-bold text-cyan-400 mb-6" style={{ fontFamily: "var(--font-pixelify)" }}>
        🤖 AGENT OFFICE
      </h1>
      
      <div className="grid grid-cols-3 gap-4">
        {agents.map((agent) => {
          return (
            <motion.div
              key={agent.id}
              className="bg-slate-800 border border-slate-700 rounded p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{agent.emoji}</span>
                <div>
                  <h3 className="font-bold" style={{ color: agent.color }}>{agent.name}</h3>
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: getStatusColor(agent.status) }}
                    />
                    <span className="text-xs text-slate-400">{agent.status}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-2">{agent.task || "No active task"}</p>
              <p className="text-xs text-slate-500">{agent.queueSize} tasks queued</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
