import KpiCards from "@/components/KpiCards";
import AgentOffice from "@/components/AgentOffice";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import FollowUps from "@/components/FollowUps";

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

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Kanban takes 3/4 */}
        <div className="xl:col-span-3">
          <KanbanBoard />
        </div>

        {/* Right sidebar: Agents + Follow-ups */}
        <div className="xl:col-span-1 space-y-4">
          <AgentOffice />
          <FollowUps />
        </div>
      </div>
    </div>
  );
}
