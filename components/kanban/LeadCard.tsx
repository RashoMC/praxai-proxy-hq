"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  Clock,
  ExternalLink,
  GripVertical,
  Linkedin,
  Mail,
} from "lucide-react";
import type { ColumnId, Lead } from "./KanbanBoard";

const priorityConfig = {
  HIGH: "border-rose-400/30 bg-rose-500/10 text-rose-200",
  MEDIUM: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  LOW: "border-slate-600 bg-slate-800 text-slate-300",
};

interface LeadCardProps {
  lead: Lead;
  columnId: ColumnId;
  isDragging?: boolean;
}

export default function LeadCard({
  lead,
  columnId,
  isDragging = false,
}: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0.45 : 1,
  };

  const priority =
    priorityConfig[lead.priority as keyof typeof priorityConfig] ?? priorityConfig.MEDIUM;
  const isOverdue = lead.followUpAt && new Date(lead.followUpAt) < new Date();
  const isLeadColumn = columnId === "LEAD";

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border bg-slate-950/90 p-4 transition ${
        isDragging
          ? "border-sky-400/40 shadow-[0_16px_36px_rgba(14,165,233,0.12)]"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 rounded-md p-1 text-slate-600 transition hover:bg-slate-800 hover:text-slate-300 active:cursor-grabbing"
          tabIndex={-1}
          aria-label={`Drag ${lead.company}`}
        >
          <GripVertical size={14} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/leads/${lead.id}`}
                className="block truncate text-sm font-semibold text-white transition hover:text-sky-300"
              >
                {lead.company}
              </Link>
              <p className="mt-1 truncate text-sm text-slate-400">
                {lead.contact ?? "No contact name"}
              </p>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${priority}`}>
              {lead.priority}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {isLeadColumn && lead.linkedin ? (
              <a
                href={lead.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-sky-300 transition hover:border-slate-700 hover:text-sky-200"
              >
                <Linkedin size={14} className="shrink-0" />
                <span className="truncate">{lead.linkedin}</span>
                <ExternalLink size={13} className="shrink-0" />
              </a>
            ) : null}

            {!isLeadColumn && lead.email ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail size={14} className="shrink-0 text-slate-500" />
                <span className="truncate">{lead.email}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">
              {lead.messageSent ? "Message sent" : "No message sent"}
            </span>
            {lead.followUpAt ? (
              <span
                className={`inline-flex items-center gap-1 ${
                  isOverdue ? "text-rose-300" : "text-slate-500"
                }`}
              >
                <Clock size={12} />
                {formatDistanceToNow(new Date(lead.followUpAt), { addSuffix: true })}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
