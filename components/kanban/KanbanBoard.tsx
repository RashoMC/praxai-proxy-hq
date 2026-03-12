"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import LeadCard from "./LeadCard";
import { Plus } from "lucide-react";
import Link from "next/link";

export interface Lead {
  id: string;
  company: string;
  contact: string | null;
  email: string | null;
  priority: string;
  status: string;
  source: string | null;
  notes: string | null;
  messageSent: boolean;
  followUpAt: string | null;
  createdAt: string;
}

const COLUMNS = [
  { id: "LEAD", label: "Lead", color: "border-slate-500", dot: "bg-slate-400", textColor: "text-slate-300", bg: "bg-slate-500/5" },
  { id: "CONNECT", label: "Connect", color: "border-blue-500", dot: "bg-blue-400", textColor: "text-blue-300", bg: "bg-blue-500/5" },
  { id: "MESSAGE", label: "Message", color: "border-purple-500", dot: "bg-purple-400", textColor: "text-purple-300", bg: "bg-purple-500/5" },
  { id: "CLOSE", label: "Close", color: "border-green-500", dot: "bg-green-400", textColor: "text-green-300", bg: "bg-green-500/5" },
  { id: "REJECTED", label: "Rejected", color: "border-rose-500", dot: "bg-rose-400", textColor: "text-rose-300", bg: "bg-rose-500/5" },
];

const STATUS_TO_COLUMN: Record<string, (typeof COLUMNS)[number]["id"]> = {
  NO_RESPONSE: "LEAD",
  CONNECTED: "CONNECT",
  RESPONDED: "MESSAGE",
  MEETING_BOOKED: "CLOSE",
  REJECTED: "REJECTED",
  LEAD: "LEAD",
  CONNECT: "CONNECT",
  MESSAGE: "MESSAGE",
  CLOSE: "CLOSE",
};

const COLUMN_TO_STATUS: Record<(typeof COLUMNS)[number]["id"], string> = {
  LEAD: "NO_RESPONSE",
  CONNECT: "CONNECTED",
  MESSAGE: "RESPONDED",
  CLOSE: "MEETING_BOOKED",
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
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLeads(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const getColumnId = (status: string) => STATUS_TO_COLUMN[status] ?? "LEAD";

  const getColumnLeads = (columnId: string) =>
    leads.filter((lead) => getColumnId(lead.status) === columnId);

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find((l) => l.id === event.active.id);
    setActiveLead(lead ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const lead = leads.find((l) => l.id === active.id);
    if (!lead) return;

    // over.id is either a column id (droppable) or a lead id (sortable)
    let targetColumnId: string | undefined;
    if (COLUMNS.find((c) => c.id === over.id)) {
      targetColumnId = over.id as string;
    } else {
      // over a lead card — find what column that lead maps to
      const overLead = leads.find((l) => l.id === over.id);
      targetColumnId = overLead ? getColumnId(overLead.status) : undefined;
    }

    const targetStatus = targetColumnId
      ? COLUMN_TO_STATUS[targetColumnId as keyof typeof COLUMN_TO_STATUS]
      : undefined;

    if (!targetStatus || lead.status === targetStatus) return;

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: targetStatus! } : l))
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {COLUMNS.map((col) => (
          <div key={col.id} className="bg-slate-800 border border-slate-700 rounded-sm p-3">
            <div className="h-5 w-20 bg-slate-700 animate-pulse rounded-sm mb-3" />
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-slate-700 animate-pulse rounded-sm mb-2" />
            ))}
          </div>
        ))}
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            leads={getColumnLeads(col.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="rotate-2 opacity-90 scale-105">
            <LeadCard lead={activeLead} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  column,
  leads,
}: {
  column: (typeof COLUMNS)[number];
  leads: Lead[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      className={`border ${column.color} border-opacity-40 rounded-sm p-3 min-h-[400px] transition-colors ${
        isOver ? "bg-slate-700/40" : "bg-slate-800/60"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${column.dot}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${column.textColor}`}>
            {column.label}
          </span>
          <span className="text-xs text-slate-500 font-mono">{leads.length}</span>
        </div>
        <Link
          href="/leads/new"
          className="text-slate-500 hover:text-cyan-400 transition-colors"
        >
          <Plus size={14} />
        </Link>
      </div>

      <div ref={setNodeRef} className="min-h-[100px]">
        <SortableContext
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
