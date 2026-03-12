"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Agent {
  id: string;
  name: string;
  emoji: string;
  color: string;
  status: string;
  task: string | null;
  queueSize: number;
  x: number;
  y: number;
  activity: string;
  lastSeen: string | null;
  updatedAt: string;
}

// Office grid: 20x15 tiles, each tile 32px
const GRID_WIDTH = 20;
const GRID_HEIGHT = 15;
const TILE_SIZE = 32;

// Office furniture layout
const FURNITURE = {
  markDesk: { x: 2, y: 2, width: 3, height: 2, type: "desk", label: "ANALYTICS" },
  prismDesk: { x: 8, y: 2, width: 3, height: 2, type: "desk", label: "OUTREACH" },
  crafterDesk: { x: 14, y: 2, width: 3, height: 2, type: "desk", label: "BUILD" },
  coffee: { x: 9, y: 8, width: 2, height: 1, type: "coffee" },
  couch: { x: 2, y: 10, width: 4, height: 2, type: "couch" },
  plant1: { x: 1, y: 1, width: 1, height: 1, type: "plant" },
  plant2: { x: 18, y: 1, width: 1, height: 1, type: "plant" },
  server: { x: 17, y: 10, width: 2, height: 3, type: "server" },
};

// Pixel art sprites for each agent
const AGENT_SPRITES: Record<string, string[]> = {
  Mark: [
    "░░▓▓▓░░░",
    "░▓📈▓░░░",
    "░░▓▓▓░░░",
    "░▓▓█▓▓░░",
    "░░▓░▓░░░",
  ],
  Prism: [
    "░░▓▓▓░░░",
    "░▓🚀▓░░░",
    "░░▓▓▓░░░",
    "░▓▓█▓▓░░",
    "░░▓░▓░░░",
  ],
  Crafter: [
    "░░▓▓▓░░░",
    "░▓⚒️▓░░░",
    "░░▓▓▓░░░",
    "░▓▓█▓▓░░",
    "░░▓░▓░░░",
  ],
};

// Activity messages
const ACTIVITIES: Record<string, string[]> = {
  Mark: [
    "Researching leads on LinkedIn...",
    "Analyzing pipeline metrics...",
    "Scoring prospects...",
    "Getting coffee...",
    "Reviewing data...",
  ],
  Prism: [
    "Drafting outreach messages...",
    "Personalizing emails...",
    "Reviewing responses...",
    "Getting coffee...",
    "Planning campaigns...",
  ],
  Crafter: [
    "Writing code...",
    "Building features...",
    "Debugging...",
    "Getting coffee...",
    "Deploying updates...",
  ],
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activityLog, setActivityLog] = useState<string[]>([]);

  // Fetch agents
  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      // Add positions and activities if not present
      const agentsWithPositions = data.map((agent: Agent, index: number) => ({
        ...agent,
        x: agent.x || [3, 9, 15][index],
        y: agent.y || [3, 3, 3][index],
        activity: agent.activity || ACTIVITIES[agent.name]?.[0] || "Working...",
      }));
      
      setAgents(agentsWithPositions);
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Simulate agent movement
  const simulateActivity = useCallback(() => {
    setAgents((prev) => {
      return prev.map((agent) => {
        const hour = currentTime.getHours();
        const isNight = hour < 9 || hour >= 23;
        
        // Night time: agents sleep on couch
        if (isNight) {
          return {
            ...agent,
            x: 3 + Math.floor(Math.random() * 2),
            y: 11,
            status: "SLEEPING",
            activity: "💤 Sleeping...",
          };
        }
        
        // Day time: random movement
        const activities = ACTIVITIES[agent.name] || ["Working..."];
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        
        // Move to different locations based on activity
        let newX = agent.x;
        let newY = agent.y;
        
        if (randomActivity.includes("coffee")) {
          newX = 9;
          newY = 8;
        } else if (agent.name === "Mark") {
          newX = 3;
          newY = 3;
        } else if (agent.name === "Prism") {
          newX = 9;
          newY = 3;
        } else {
          newX = 15;
          newY = 3;
        }
        
        return {
          ...agent,
          x: newX,
          y: newY,
          status: randomActivity.includes("coffee") ? "BREAK" : "WORKING",
          activity: randomActivity,
        };
      });
    });
    
    // Add to activity log
    setActivityLog((prev) => {
      const newLog = [...prev];
      agents.forEach((agent) => {
        if (agent.activity && !newLog.includes(`${agent.name}: ${agent.activity}`)) {
          newLog.unshift(`${agent.name}: ${agent.activity}`);
        }
      });
      return newLog.slice(0, 10);
    });
  }, [agents, currentTime]);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, [fetchAgents]);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    const activityInterval = setInterval(simulateActivity, 8000);
    return () => clearInterval(activityInterval);
  }, [simulateActivity]);

  const isNight = currentTime.getHours() < 9 || currentTime.getHours() >= 23;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 font-mono animate-pulse">Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400" style={{ fontFamily: "var(--font-pixelify)" }}>
            🤖 AGENT OFFICE
          </h1>
          <p className="text-slate-400 text-sm">
            {currentTime.toLocaleTimeString("da-DK")} {isNight ? "🌙 Night" : "☀️ Day"}
          </p>
        </div>
        <div className="flex gap-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="px-3 py-1 rounded text-xs font-mono border"
              style={{
                borderColor: agent.color,
                color: agent.color,
                backgroundColor: `${agent.color}20`,
              }}
            >
              {agent.emoji} {agent.name}: {agent.status}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {/* Office Map */}
        <div className="flex-1">
          <div
            className="relative bg-slate-800 rounded border-2 border-slate-700 overflow-hidden"
            style={{
              width: GRID_WIDTH * TILE_SIZE,
              height: GRID_HEIGHT * TILE_SIZE,
              backgroundImage: `
                linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: `${TILE_SIZE}px ${TILE_SIZE}px`,
            }}
          >
            {/* Furniture */}
            {Object.entries(FURNITURE).map(([key, item]) => (
              <div
                key={key}
                className="absolute flex items-center justify-center text-xs font-mono"
                style={{
                  left: item.x * TILE_SIZE,
                  top: item.y * TILE_SIZE,
                  width: item.width * TILE_SIZE,
                  height: item.height * TILE_SIZE,
                  backgroundColor:
                    item.type === "desk"
                      ? "rgba(6, 182, 212, 0.1)"
                      : item.type === "coffee"
                      ? "rgba(139, 92, 246, 0.1)"
                      : item.type === "couch"
                      ? "rgba(16, 185, 129, 0.1)"
                      : "rgba(100, 116, 139, 0.2)",
                  border:
                    item.type === "desk"
                      ? "1px solid rgba(6, 182, 212, 0.3)"
                      : item.type === "coffee"
                      ? "1px solid rgba(139, 92, 246, 0.3)"
                      : item.type === "couch"
                      ? "1px solid rgba(16, 185, 129, 0.3)"
                      : "1px solid rgba(100, 116, 139, 0.3)",
                }}
              >
                {item.type === "desk" && (
                  <span className="text-slate-500">🖥️ {item.label}</span>
                )}
                {item.type === "coffee" && <span className="text-slate-500">☕</span>}
                {item.type === "couch" && <span className="text-slate-500">🛋️</span>}
                {item.type === "plant" && <span className="text-slate-500">🪴</span>}
                {item.type === "server" && <span className="text-slate-500">🖥️</span>}
              </div>
            ))}

            {/* Agents */}
            {agents.map((agent) => (
              <motion.div
                key={agent.id}
                className="absolute flex flex-col items-center"
                initial={{ x: agent.x * TILE_SIZE, y: agent.y * TILE_SIZE }}
                animate={{ x: agent.x * TILE_SIZE, y: agent.y * TILE_SIZE }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                style={{ width: TILE_SIZE * 2 }}
              >
                {/* Agent Sprite */}
                <div
                  className="text-2xl relative"
                  style={{
                    filter: agent.status === "SLEEPING" ? "grayscale(0.5)" : "none",
                    opacity: agent.status === "SLEEPING" ? 0.7 : 1,
                  }}
                >
                  {agent.status === "SLEEPING" ? "😴" : agent.emoji}
                  {/* Status dot */}
                  <span
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
                    style={{
                      backgroundColor:
                        agent.status === "WORKING"
                          ? "#10b981"
                          : agent.status === "BREAK"
                          ? "#f59e0b"
                          : agent.status === "SLEEPING"
                          ? "#6366f1"
                          : "#ef4444",
                    }}
                  />
                </div>
                {/* Agent name */}
                <span
                  className="text-[10px] font-mono mt-1 px-1 rounded"
                  style={{
                    backgroundColor: agent.color,
                    color: "#000",
                  }}
                >
                  {agent.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className="w-80">
          <div className="bg-slate-800 rounded border border-slate-700 p-4">
            <h3 className="text-sm font-bold text-slate-300 mb-3 font-mono">
              📋 ACTIVITY LOG
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activityLog.length === 0 ? (
                <p className="text-slate-500 text-xs">No activity yet...</p>
              ) : (
                activityLog.map((log, i) => (
                  <div
                    key={i}
                    className="text-xs text-slate-400 border-l-2 border-slate-600 pl-2 py-1"
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Agent Stats */}
          <div className="mt-4 bg-slate-800 rounded border border-slate-700 p-4">
            <h3 className="text-sm font-bold text-slate-300 mb-3 font-mono">
              📊 AGENT STATS
            </h3>
            {agents.map((agent) => (
              <div key={agent.id} className="mb-3 last:mb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span>{agent.emoji}</span>
                  <span className="text-sm font-medium" style={{ color: agent.color }}>
                    {agent.name}
                  </span>
                  <span className="text-xs text-slate-500">({agent.queueSize} tasks)</span>
                </div>
                <p className="text-xs text-slate-400 truncate">{agent.activity}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
