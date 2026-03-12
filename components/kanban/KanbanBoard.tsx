"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Link from "next/link";
import { Plus } from "lucide-react";
import LeadCard from "./LeadCard";

export type ColumnId =
  | "LEAD"
  | "CONNECT"
  | "MESSAGE"
  | "SCHEDULE_CALL"
  | "CLOSED"
  | "REJECTED";

export interface Lead {
  id: string;
  company: string;
  contact: string | null;
  email: string | null;
  linkedin: string | null;
  priority: string;
  status: string;
  source: string | null;
  notes: string | null;
  messageSent: boolean;
  followUpAt: string | null;
  createdAt: string;
}

const COLUMNS = [
  {
    id: "LEAD",
    label: "Lead",
    description: "LinkedIn queue",
    color: "border-sky-500/30",
    dot: "bg-sky-400",
    textColor: "text-sky-200",
    bg: "bg-sky-500/5",
  },
  {
    id: "CONNECT",
    label: "Connect",
    description: "Request sent",
    color: "border-indigo-500/30",
    dot: "bg-indigo-400",
    textColor: "text-indigo-200",
    bg: "bg-indigo-500/5",
  },
  {
    id: "MESSAGE",
    label: "Message",
    description: "Accepted and messaging",
    color: "border-violet-500/30",
    dot: "bg-violet-400",
    textColor: "text-violet-200",
    bg: "bg-violet-500/5",
  },
  {
    id: "SCHEDULE_CALL",
    label: "Schedule Call",
    description: "Booking a meeting",
    color: "border-amber-500/30",
    dot: "bg-amber-400",
    textColor: "text-amber-200",
    bg: "bg-amber-500/5",
  },
  {
    id: "CLOSED",
    label: "Closed",
    description: "Won deal",
    color: "border-emerald-500/30",
    dot: "bg-emerald-400",
    textColor: "text-emerald-200",
    bg: "bg-emerald-500/5",
  },
  {
    id: "REJECTED",
    label: "Rejected",
    description: "Separate archive",
    color: "border-rose-500/30",
    dot: "bg-rose-400",
    textColor: "text-rose-200",
    bg: "bg-rose-500/5",
  },
] as const;

const MAIN_COLUMNS = COLUMNS.filter((column) => column.id !== "REJECTED");

const STATUS_TO_COLUMN: Record<string, ColumnId> = {
  NO_RESPONSE: "LEAD",
  CONNECTED: "CONNECT",
  RESPONDED: "MESSAGE",
  MEETING_BOOKED: "SCHEDULE_CALL",
  REJECTED: "REJECTED",
  LEAD: "LEAD",
  CONNECT: "CONNECT",
  MESSAGE: "MESSAGE",
  SCHEDULE_CALL: "SCHEDULE_CALL",
  CLOSED: "CLOSED",
  CLOSE: "CLOSED",
};

const COLUMN_TO_STATUS: Record<ColumnId, string> = {
  LEAD: "LEAD",
  CONNECT: "CONNECT",
  MESSAGE: "MESSAGE",
  SCHEDULE_CALL: "SCHEDULE_CALL",
  CLOSED: "CLOSED",
  REJECTED: "REJECTED",
};

export default function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchLeads = useCallback(() => {
    fetch("/api/leads", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLeads(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const getColumnId = (status: string): ColumnId => STATUS_TO_COLUMN[status] ?? "LEAD";

  const getColumnLeads = (columnId: ColumnId) =>
    leads.filter((lead) => getColumnId(lead.status) === columnId);

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find((item) => item.id === event.active.id);
    setActiveLead(lead ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;

    if (!over) {
      return;
    }

    const lead = leads.find((item) => item.id === active.id);
    if (!lead) {
      return;
    }

    let targetColumnId: ColumnId | undefined;

    if (COLUMNS.some((column) => column.id === over.id)) {
      targetColumnId = over.id as ColumnId;
    } else {
      const overLead = leads.find((item) => item.id === over.id);
      targetColumnId = overLead ? getColumnId(overLead.status) : undefined;
    }

    const targetStatus = targetColumnId ? COLUMN_TO_STATUS[targetColumnId] : undefined;
    if (!targetStatus || lead.status === targetStatus) {
      return;
    }

    setLeads((current) =>
      current.map((item) =>
        item.id === lead.id ? { ...item, status: targetStatus } : item
      )
    );

    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, status: targetStatus }),
      });
    } catch {
      fetchLeads();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          {MAIN_COLUMNS.map((column) => (
            <div key={column.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="mb-4 h-5 w-28 animate-pulse rounded bg-slate-800" />
              {[1, 2].map((item) => (
                <div key={item} className="mb-3 h-28 animate-pulse rounded-xl bg-slate-800" />
              ))}
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="mb-4 h-5 w-28 animate-pulse rounded bg-slate-800" />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-xl bg-slate-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          {MAIN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              leads={getColumnLeads(column.id)}
            />
          ))}
        </div>

        <KanbanColumn
          column={COLUMNS.find((column) => column.id === "REJECTED")!}
          leads={getColumnLeads("REJECTED")}
          isRejected
        />
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="rotate-2 opacity-90">
            <LeadCard
              lead={activeLead}
              isDragging
              columnId={getColumnId(activeLead.status)}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  column,
  leads,
  isRejected = false,
}: {
  column: (typeof COLUMNS)[number];
  leads: Lead[];
  isRejected?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <section
      className={`rounded-2xl border p-4 transition ${
        isRejected ? "min-h-[220px]" : "min-h-[440px]"
      } ${column.color} ${
        isOver ? `${column.bg} shadow-[0_0_0_1px_rgba(148,163,184,0.12)]` : "bg-slate-900/80"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${column.dot}`} />
            <h3 className={`text-sm font-semibold ${column.textColor}`}>{column.label}</h3>
            <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs font-medium text-slate-400">
              {leads.length}
            </span>
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
            {column.description}
          </p>
        </div>

        <Link
          href="/leads/new"
          className="rounded-lg border border-slate-700 p-2 text-slate-500 transition hover:border-slate-600 hover:text-sky-300"
        >
          <Plus size={14} />
        </Link>
      </div>

      <div ref={setNodeRef} className="min-h-[100px]">
        <SortableContext
          items={leads.map((lead) => lead.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={isRejected ? "grid gap-3 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} columnId={column.id} />
            ))}
            {leads.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-500">
                No leads here.
              </div>
            ) : null}
          </div>
        </SortableContext>
      </div>
    </section>
  );
}
