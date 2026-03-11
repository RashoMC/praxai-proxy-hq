"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { Mail, Linkedin, Clock, GripVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Lead } from "./KanbanBoard";

const priorityConfig = {
  HIGH: { badge: "bg-red-500/10 text-red-400 border-red-500/30", label: "HIGH" },
  MEDIUM: { badge: "bg-amber-500/10 text-amber-400 border-amber-500/30", label: "MED" },
  LOW: { badge: "bg-slate-500/10 text-slate-400 border-slate-500/30", label: "LOW" },
};

interface LeadCardProps {
  lead: Lead;
  isDragging?: boolean;
}

export default function LeadCard({ lead, isDragging = false }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortDragging } =
    useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0.4 : 1,
  };

  const priority = priorityConfig[lead.priority as keyof typeof priorityConfig] ?? priorityConfig.MEDIUM;

  const isOverdue =
    lead.followUpAt && new Date(lead.followUpAt) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-slate-700/60 border rounded-sm p-2.5 group transition-all ${
        isDragging
          ? "border-cyan-500/60 shadow-lg shadow-cyan-500/10"
          : "border-slate-600 hover:border-slate-500"
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0"
          tabIndex={-1}
        >
          <GripVertical size={12} />
        </button>

        <div className="flex-1 min-w-0">
          {/* Company + priority */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <Link
              href={`/leads/${lead.id}`}
              className="text-sm font-semibold text-slate-200 hover:text-cyan-400 transition-colors truncate"
            >
              {lead.company}
            </Link>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border flex-shrink-0 font-mono ${priority.badge}`}>
              {priority.label}
            </span>
          </div>

          {/* Contact */}
          {lead.contact && (
            <p className="text-xs text-slate-400 truncate mb-1.5">{lead.contact}</p>
          )}

          {/* Links + indicators */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {lead.email && (
                <Mail size={11} className="text-slate-500 hover:text-cyan-400 transition-colors" />
              )}
              {lead.messageSent && (
                <span className="text-[10px] text-green-400 font-mono">✓ sent</span>
              )}
            </div>

            {lead.followUpAt && (
              <span
                className={`flex items-center gap-1 text-[10px] font-mono ${
                  isOverdue ? "text-red-400" : "text-slate-500"
                }`}
              >
                <Clock size={10} />
                {formatDistanceToNow(new Date(lead.followUpAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
