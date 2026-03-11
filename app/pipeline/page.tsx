import KanbanBoard from "@/components/kanban/KanbanBoard";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-xl font-bold text-cyan-400"
          style={{ fontFamily: "var(--font-pixelify)" }}
        >
          // PIPELINE
        </h1>
        <Link
          href="/leads/new"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-sm hover:bg-cyan-500/20 transition-colors"
        >
          <Plus size={14} />
          <span>Add Lead</span>
        </Link>
      </div>

      <KanbanBoard />
    </div>
  );
}
