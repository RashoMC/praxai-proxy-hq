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

const PRIORITY_LEFT_BORDER: Record<string, string> = {
  HIGH: "border-l-rose-400",
  MEDIUM: "border-l-amber-400",
  LOW: "border-l-slate-600",
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

  const priorityBorder =
    PRIORITY_LEFT_BORDER[lead.priority] ?? PRIORITY_LEFT_BORDER.MEDIUM;
  const isOverdue = lead.followUpAt && new Date(lead.followUpAt) < new Date();
  const isLeadColumn = columnId === "LEAD";

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-sm border-2 border-l-4 bg-[#0a1422] p-3 transition ${priorityBorder} ${
        isDragging
          ? "border-sky-400/50 shadow-[0_12px_28px_rgba(14,165,233,0.18)]"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 rounded-sm p-1 text-slate-600 transition hover:bg-slate-800 hover:text-slate-300 active:cursor-grabbing"
          tabIndex={-1}
          aria-label={`Drag ${lead.company}`}
        >
          <GripVertical size={13} />
        </button>

        <div className="min-w-0 flex-1">
          <Link
            href={`/leads/${lead.id}`}
            className="block break-words text-sm font-bold text-white transition hover:text-sky-300"
            style={{ fontFamily: "var(--font-pixelify)" }}
          >
            {lead.company}
          </Link>
          <p className="mt-0.5 break-words text-xs text-slate-400">
            {lead.contact ?? "No contact"}
          </p>

          <div className="mt-2 space-y-1.5">
            {isLeadColumn && lead.linkedin ? (
              <a
                href={lead.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-sm border-2 border-slate-800 bg-slate-900/70 px-2 py-1 text-xs text-sky-300 transition hover:border-slate-700 hover:text-sky-200"
              >
                <Linkedin size={12} className="shrink-0" />
                <span className="truncate">{lead.linkedin}</span>
                <ExternalLink size={11} className="ml-auto shrink-0" />
              </a>
            ) : null}

            {!isLeadColumn && lead.email ? (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Mail size={12} className="shrink-0 text-slate-500" />
                <span className="truncate">{lead.email}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
            <span className="font-mono uppercase tracking-widest text-slate-600">
              {lead.messageSent ? "MSG SENT" : "NO MSG"}
            </span>
            {lead.followUpAt ? (
              <span
                className={`inline-flex items-center gap-1 font-mono ${
                  isOverdue ? "text-rose-400" : "text-slate-500"
                }`}
              >
                <Clock size={11} />
                {formatDistanceToNow(new Date(lead.followUpAt), {
                  addSuffix: true,
                })}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
