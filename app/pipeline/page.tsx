"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Linkedin,
  Mail,
  Phone,
  Plus,
  UserRound,
  XCircle,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

export const dynamic = "force-dynamic";

type LeadStatus =
  | "NO_RESPONSE"
  | "CONNECTED"
  | "RESPONDED"
  | "MEETING_BOOKED"
  | "REJECTED"
  | "LEAD"
  | "CONNECT"
  | "MESSAGE"
  | "SCHEDULE_CALL"
  | "CLOSED"
  | "CLOSE";

type StageId =
  | "LEAD"
  | "CONNECT"
  | "MESSAGE"
  | "SCHEDULE_CALL"
  | "CLOSED"
  | "REJECTED";

interface Activity {
  id: string;
  type: string;
  note: string | null;
  createdAt: string;
}

interface Lead {
  id: string;
  company: string;
  contact: string | null;
  email: string | null;
  linkedin: string | null;
  phone: string | null;
  priority: string;
  status: LeadStatus;
  source: string | null;
  notes: string | null;
  messageDraft: string | null;
  messageSent: boolean;
  followUpAt: string | null;
  createdAt: string;
  updatedAt: string;
  activities?: Activity[];
}

const MAIN_STAGES: Array<{
  id: Exclude<StageId, "REJECTED">;
  label: string;
  description: string;
  accent: string;
  chip: string;
  panel: string;
}> = [
  {
    id: "LEAD",
    label: "Lead",
    description: "New prospects ready for connection requests.",
    accent: "text-sky-300",
    chip: "bg-sky-500/12 text-sky-200 border-sky-400/25",
    panel: "border-sky-400/20 bg-slate-950/80",
  },
  {
    id: "CONNECT",
    label: "Connect",
    description: "Connection request sent and awaiting response.",
    accent: "text-indigo-300",
    chip: "bg-indigo-500/12 text-indigo-200 border-indigo-400/25",
    panel: "border-indigo-400/20 bg-slate-950/80",
  },
  {
    id: "MESSAGE",
    label: "Message",
    description: "Accepted and actively being messaged.",
    accent: "text-violet-300",
    chip: "bg-violet-500/12 text-violet-200 border-violet-400/25",
    panel: "border-violet-400/20 bg-slate-950/80",
  },
  {
    id: "SCHEDULE_CALL",
    label: "Schedule Call",
    description: "Coordinating availability and booking a meeting.",
    accent: "text-amber-300",
    chip: "bg-amber-500/12 text-amber-200 border-amber-400/25",
    panel: "border-amber-400/20 bg-slate-950/80",
  },
  {
    id: "CLOSED",
    label: "Closed",
    description: "Won opportunities and completed deals.",
    accent: "text-emerald-300",
    chip: "bg-emerald-500/12 text-emerald-200 border-emerald-400/25",
    panel: "border-emerald-400/20 bg-slate-950/80",
  },
];

const REJECTED_STAGE = {
  id: "REJECTED" as const,
  label: "Rejected",
  description: "Archived out of the main flow.",
  accent: "text-rose-300",
  chip: "bg-rose-500/12 text-rose-200 border-rose-400/25",
  panel: "border-rose-400/20 bg-slate-950/80",
};

const STATUS_TO_STAGE: Record<LeadStatus, StageId> = {
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

const STAGE_TO_STATUS: Record<StageId, LeadStatus> = {
  LEAD: "LEAD",
  CONNECT: "CONNECT",
  MESSAGE: "MESSAGE",
  SCHEDULE_CALL: "SCHEDULE_CALL",
  CLOSED: "CLOSED",
  REJECTED: "REJECTED",
};

const STAGE_ORDER: StageId[] = [
  "LEAD",
  "CONNECT",
  "MESSAGE",
  "SCHEDULE_CALL",
  "CLOSED",
  "REJECTED",
];

const PRIORITY_TONE: Record<string, string> = {
  HIGH: "border-rose-400/30 bg-rose-500/10 text-rose-200",
  MEDIUM: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  LOW: "border-slate-500/30 bg-slate-800 text-slate-300",
};

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/leads", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setLeads(data);
          setSelectedLeadId((current) => current ?? data[0]?.id ?? null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const getStageId = (status: LeadStatus): StageId => STATUS_TO_STAGE[status] ?? "LEAD";

  const getStageLeads = (stageId: StageId) =>
    leads.filter((lead) => getStageId(lead.status) === stageId);

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? null;

  const moveLead = async (lead: Lead, nextStage: StageId) => {
    const currentStage = getStageId(lead.status);
    const nextStatus = STAGE_TO_STATUS[nextStage];

    if (currentStage === nextStage || updatingLeadId) {
      return;
    }

    const previousStatus = lead.status;
    setUpdatingLeadId(lead.id);
    setLeads((current) =>
      current.map((item) =>
        item.id === lead.id
          ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() }
          : item
      )
    );

    try {
      const response = await fetch(`/api/leads/${lead.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, oldStatus: previousStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update lead ${lead.id}`);
      }
    } catch {
      setLeads((current) =>
        current.map((item) =>
          item.id === lead.id ? { ...item, status: previousStatus } : item
        )
      );
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const totalLeads = leads.length;
  const closedLeads = getStageLeads("CLOSED").length;
  const activeLeads = totalLeads - closedLeads - getStageLeads("REJECTED").length;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_35%),linear-gradient(180deg,#0f172a_0%,#020617_100%)] p-6 shadow-[0_18px_60px_rgba(2,6,23,0.45)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
              Pipeline
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Clean prospect flow from LinkedIn outreach to closed deal
              </h1>
              <p className="text-sm leading-6 text-slate-400 sm:text-base">
                Lead starts as a scan-friendly list for connection requests, then moves through connect, message, scheduling, and close. Rejected leads stay visible, but out of the main flow.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <MetricChip label="Total Leads" value={String(totalLeads)} />
            <MetricChip label="Active Pipeline" value={String(activeLeads)} />
            <MetricChip label="Closed" value={String(closedLeads)} accent="text-emerald-300" />
            <Link
              href="/leads/new"
              className="inline-flex items-center gap-2 rounded-xl border border-sky-400/25 bg-sky-500/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-500/20"
            >
              <Plus size={16} />
              Add lead
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-5">
            {MAIN_STAGES.map((stage, index) => {
              const stageLeads = getStageLeads(stage.id);

              return (
                <section
                  key={stage.id}
                  className={`rounded-2xl border p-4 shadow-[0_10px_30px_rgba(2,6,23,0.28)] ${stage.panel}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className={`text-base font-semibold ${stage.accent}`}>
                          {stage.label}
                        </h2>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${stage.chip}`}>
                          {stageLeads.length}
                        </span>
                      </div>
                      <p className="text-sm leading-5 text-slate-400">{stage.description}</p>
                    </div>
                    {index < MAIN_STAGES.length - 1 ? (
                      <ArrowRight className="mt-1 hidden h-4 w-4 text-slate-600 xl:block" />
                    ) : null}
                  </div>

                  <div className="mt-4 space-y-3">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, skeletonIndex) => (
                        <div
                          key={`${stage.id}-${skeletonIndex}`}
                          className="h-28 animate-pulse rounded-xl border border-slate-800 bg-slate-900/70"
                        />
                      ))
                    ) : stage.id === "LEAD" ? (
                      stageLeads.length > 0 ? (
                        stageLeads.map((lead) => (
                          <LeadListRow
                            key={lead.id}
                            lead={lead}
                            selected={selectedLeadId === lead.id}
                            busy={updatingLeadId === lead.id}
                            onSelect={() => setSelectedLeadId(lead.id)}
                            onMove={() => moveLead(lead, "CONNECT")}
                          />
                        ))
                      ) : (
                        <EmptyStage message="No fresh leads to action." />
                      )
                    ) : stageLeads.length > 0 ? (
                      <AnimatePresence initial={false}>
                        {stageLeads.map((lead) => (
                          <FlowCard
                            key={lead.id}
                            lead={lead}
                            selected={selectedLeadId === lead.id}
                            busy={updatingLeadId === lead.id}
                            onSelect={() => setSelectedLeadId(lead.id)}
                          />
                        ))}
                      </AnimatePresence>
                    ) : (
                      <EmptyStage message={`No leads in ${stage.label.toLowerCase()}.`} />
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          <section className={`rounded-2xl border p-4 shadow-[0_10px_30px_rgba(2,6,23,0.28)] ${REJECTED_STAGE.panel}`}>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-semibold ${REJECTED_STAGE.accent}`}>
                {REJECTED_STAGE.label}
              </h2>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${REJECTED_STAGE.chip}`}>
                {getStageLeads("REJECTED").length}
              </span>
            </div>
            <p className="mt-1 text-sm leading-5 text-slate-400">
              Kept in a separate archive so the active pipeline stays clean.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, skeletonIndex) => (
                  <div
                    key={`rejected-${skeletonIndex}`}
                    className="h-28 animate-pulse rounded-xl border border-slate-800 bg-slate-900/70"
                  />
                ))
              ) : getStageLeads("REJECTED").length > 0 ? (
                getStageLeads("REJECTED").map((lead) => (
                  <FlowCard
                    key={lead.id}
                    lead={lead}
                    selected={selectedLeadId === lead.id}
                    busy={updatingLeadId === lead.id}
                    onSelect={() => setSelectedLeadId(lead.id)}
                    compact
                  />
                ))
              ) : (
                <EmptyStage message="No rejected leads." />
              )}
            </div>
          </section>
        </div>

        <aside className="rounded-2xl border border-slate-800 bg-slate-950/85 p-5 shadow-[0_14px_40px_rgba(2,6,23,0.35)]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Lead Detail
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                {selectedLead ? selectedLead.company : "Select a lead"}
              </h2>
            </div>
            {selectedLead ? (
              <Link
                href={`/leads/${selectedLead.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white"
              >
                <UserRound size={14} />
                Open
              </Link>
            ) : null}
          </div>

          {selectedLead ? (
            <motion.div
              key={selectedLead.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 pt-5"
            >
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-white">{selectedLead.company}</p>
                    <p className="text-sm text-slate-400">
                      {selectedLead.contact ?? "No contact name"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      PRIORITY_TONE[selectedLead.priority] ?? PRIORITY_TONE.MEDIUM
                    }`}
                  >
                    {selectedLead.priority}
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <DetailRow label="Stage" value={getStageId(selectedLead.status)} />
                  <DetailRow label="Source" value={selectedLead.source ?? "Not set"} />
                  <DetailRow label="Email" value={selectedLead.email ?? "Not set"} />
                  <DetailRow label="Phone" value={selectedLead.phone ?? "Not set"} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-sm font-semibold text-white">Quick Actions</p>
                <div className="mt-3 grid gap-2">
                  {STAGE_ORDER.filter((stageId) => stageId !== getStageId(selectedLead.status)).map(
                    (stageId) => (
                      <button
                        key={stageId}
                        type="button"
                        onClick={() => moveLead(selectedLead, stageId)}
                        disabled={updatingLeadId === selectedLead.id}
                        className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-3 text-left text-sm text-slate-200 transition hover:border-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span>{stageId.replace("_", " ")}</span>
                        <ChevronRight size={16} className="text-slate-500" />
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-sm font-semibold text-white">Notes</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {selectedLead.notes ?? "No notes yet."}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="pt-5">
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-6 text-sm leading-6 text-slate-500">
                Select any lead to review contact details, open the full record, or move it to the next pipeline stage.
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function LeadListRow({
  lead,
  selected,
  busy,
  onSelect,
  onMove,
}: {
  lead: Lead;
  selected: boolean;
  busy: boolean;
  onSelect: () => void;
  onMove: () => void;
}) {
  return (
    <div
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-sky-400/40 bg-sky-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.15)]"
          : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
      }`}
    >
      <button type="button" onClick={onSelect} className="block w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="truncate text-base font-semibold text-white">{lead.company}</p>
            <p className="truncate text-sm text-slate-400">
              {lead.contact ?? "No contact name"}
            </p>
          </div>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
              PRIORITY_TONE[lead.priority] ?? PRIORITY_TONE.MEDIUM
            }`}
          >
            {lead.priority}
          </span>
        </div>

        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
          <div className="flex items-start gap-2 text-sm text-slate-300">
            <Linkedin size={16} className="mt-0.5 shrink-0 text-sky-300" />
            <div className="min-w-0">
              {lead.linkedin ? (
                <span className="truncate text-sky-200">{lead.linkedin}</span>
              ) : (
                <span className="text-slate-500">No LinkedIn URL</span>
              )}
            </div>
          </div>
        </div>
      </button>

      <div className="mt-4 flex items-center justify-between gap-3">
        {lead.linkedin ? (
          <a
            href={lead.linkedin}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-sky-300 transition hover:text-sky-200"
          >
            <ExternalLink size={14} className="shrink-0" />
            <span className="truncate">Open LinkedIn</span>
          </a>
        ) : (
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Add a LinkedIn URL to action this lead
          </p>
        )}
        <button
          type="button"
          onClick={onMove}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-sky-400/25 bg-sky-500/10 px-3 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowRight size={14} />
          {busy ? "Moving..." : "Move to Connect"}
        </button>
      </div>
    </div>
  );
}

function FlowCard({
  lead,
  selected,
  busy,
  onSelect,
  compact = false,
}: {
  lead: Lead;
  selected: boolean;
  busy: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  return (
    <motion.button
      layout
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-slate-600 bg-slate-900 shadow-[0_0_0_1px_rgba(148,163,184,0.12)]"
          : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-white">{lead.company}</p>
          <p className="mt-1 truncate text-sm text-slate-400">
            {lead.contact ?? "No contact name"}
          </p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
            PRIORITY_TONE[lead.priority] ?? PRIORITY_TONE.MEDIUM
          }`}
        >
          {lead.priority}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-400">
        {lead.email ? (
          <InlineInfo icon={<Mail size={14} />} value={lead.email} />
        ) : null}
        {lead.phone ? (
          <InlineInfo icon={<Phone size={14} />} value={lead.phone} />
        ) : null}
        {!compact && lead.linkedin ? (
          <InlineInfo icon={<Linkedin size={14} />} value={lead.linkedin} />
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>{busy ? "Updating..." : "Ready"}</span>
        {getStageIdLabel(lead.status)}
      </div>
    </motion.button>
  );
}

function InlineInfo({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 truncate">
      <span className="shrink-0 text-slate-500">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}

function EmptyStage({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-500">
      {message}
    </div>
  );
}

function MetricChip({
  label,
  value,
  accent = "text-white",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/85 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <span className="max-w-[65%] text-right text-sm text-slate-200">{value}</span>
    </div>
  );
}

function getStageIdLabel(status: LeadStatus) {
  const stage = STATUS_TO_STAGE[status] ?? "LEAD";

  if (stage === "CLOSED") {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-300">
        <CheckCircle2 size={14} />
        Closed
      </span>
    );
  }

  if (stage === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 text-rose-300">
        <XCircle size={14} />
        Rejected
      </span>
    );
  }

  return <span>{stage.replace("_", " ")}</span>;
}
