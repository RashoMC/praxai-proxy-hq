import KpiCards from "@/components/KpiCards";
import AgentOffice from "@/components/AgentOffice";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-xl font-bold text-cyan-400"
          style={{ fontFamily: "var(--font-pixelify)" }}
        >
          // PROXY HQ
        </h1>
        <span className="text-xs text-slate-500 font-mono">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* KPI Row */}
      <KpiCards />

      {/* Agent Office */}
      <AgentOffice />
    </div>
  );
}
