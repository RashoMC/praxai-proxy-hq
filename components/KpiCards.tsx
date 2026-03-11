"use client";

import { useEffect, useState } from "react";
import { Users, Target, TrendingUp } from "lucide-react";

interface KpiData {
  totalLeads: number;
  conversionRate: number;
  pipelineLeads: number;
}

export default function KpiCards() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/kpis")
      .then((r) => r.json())
      .then((data) => {
        setKpis(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: "Total Leads",
      value: kpis?.totalLeads ?? "-",
      icon: Users,
      color: "text-cyan-400",
      border: "border-cyan-500/30",
      bg: "bg-cyan-500/5",
    },
    {
      label: "Conversion",
      value: kpis ? `${kpis.conversionRate}%` : "-",
      icon: Target,
      color: "text-green-400",
      border: "border-green-500/30",
      bg: "bg-green-500/5",
    },
    {
      label: "Pipeline",
      value: kpis?.pipelineLeads ?? "-",
      icon: TrendingUp,
      color: "text-purple-400",
      border: "border-purple-500/30",
      bg: "bg-purple-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {cards.map(({ label, value, icon: Icon, color, border, bg }) => (
        <div
          key={label}
          className={`${bg} border ${border} rounded-sm p-4 transition-all hover:border-opacity-60`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs uppercase tracking-wider">{label}</span>
            <Icon size={16} className={color} />
          </div>
          <div className={`text-2xl font-bold ${color} ${loading ? "animate-pulse" : ""}`}>
            {loading ? "..." : value}
          </div>
        </div>
      ))}
    </div>
  );
}
