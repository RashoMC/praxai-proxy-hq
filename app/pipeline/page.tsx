"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Plus,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

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
  | "CLOSE";

type StageId = "LEAD" | "CONNECT" | "MESSAGE" | "CLOSE" | "REJECTED";

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

const STAGES: Array<{
  id: StageId;
  label: string;
  icon: PixelMap;
  accent: string;
  glow: string;
  border: string;
  rail: string;
  detail: string;
}> = [
  {
    id: "LEAD",
    label: "Lead",
    icon: "desk",
    accent: "#22d3ee",
    glow: "rgba(34, 211, 238, 0.28)",
    border: "rgba(34, 211, 238, 0.4)",
    rail: "from-cyan-400/70 to-cyan-500/15",
    detail: "Intel desk receiving fresh targets.",
  },
  {
    id: "CONNECT",
    label: "Connect",
    icon: "computer",
    accent: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.28)",
    border: "rgba(139, 92, 246, 0.4)",
    rail: "from-violet-400/70 to-violet-500/15",
    detail: "Terminal station opening the line.",
  },
  {
    id: "MESSAGE",
    label: "Message",
    icon: "phone",
    accent: "#22c55e",
    glow: "rgba(34, 197, 94, 0.28)",
    border: "rgba(34, 197, 94, 0.4)",
    rail: "from-emerald-400/70 to-emerald-500/15",
    detail: "Comms deck pushing message drafts.",
  },
  {
    id: "CLOSE",
    label: "Close",
    icon: "handshake",
    accent: "#e879f9",
    glow: "rgba(232, 121, 249, 0.28)",
    border: "rgba(232, 121, 249, 0.4)",
    rail: "from-fuchsia-400/70 to-fuchsia-500/15",
    detail: "Treaty table locking in wins.",
  },
  {
    id: "REJECTED",
    label: "Rejected",
    icon: "avatarD",
    accent: "#fb7185",
    glow: "rgba(251, 113, 133, 0.24)",
    border: "rgba(251, 113, 133, 0.35)",
    rail: "from-rose-400/70 to-rose-500/15",
    detail: "Archive lane for declined targets.",
  },
];

type PixelMap = "desk" | "computer" | "phone" | "handshake" | "avatarA" | "avatarB" | "avatarC" | "avatarD";

const PIXELS: Record<PixelMap, string[]> = {
  desk: [
    "..aaaaaa..",
    ".abbbbbba.",
    "abccccccba",
    "abccccccba",
    ".abbbbbba.",
    "...d..d...",
    "...d..d...",
    "..dd..dd..",
  ],
  computer: [
    "..aaaaaa..",
    ".abbbbbba.",
    "abccccccba",
    "abccccccba",
    ".abbbbbba.",
    "...adda...",
    "..eeeeee..",
    "..e....e..",
  ],
  phone: [
    "...aaaa...",
    "..abbbba..",
    ".abccccba.",
    ".abccccba.",
    ".abccccba.",
    ".abddddba.",
    "..abbbba..",
    "...aaaa...",
  ],
  handshake: [
    "..aa..bb..",
    ".acccbbbd.",
    "acccceebbd",
    "afffeeeegd",
    ".affhhggd.",
    "..ahhhgd..",
    "...aiigd..",
    "....ii....",
  ],
  avatarA: [
    "..aaaa..",
    ".abbbba.",
    ".acccca.",
    ".acddca.",
    ".acccca.",
    "..aeea..",
    "..effe..",
    ".ff..ff.",
  ],
  avatarB: [
    "..aaaa..",
    ".abbbba.",
    ".acccca.",
    ".acdcca.",
    ".acccca.",
    "..aeea..",
    ".effffe.",
    ".ff..ff.",
  ],
  avatarC: [
    "..aaaa..",
    ".abbbba.",
    ".acccca.",
    ".adcdda.",
    ".acccca.",
    "..aeea..",
    "..effe..",
    ".f....f.",
  ],
  avatarD: [
    "..aaaa..",
    ".abbbba.",
    ".acccca.",
    ".acddca.",
    ".acccca.",
    ".eeaeea.",
    "..effe..",
    ".ff..ff.",
  ],
};

const PIXEL_PALETTES: Record<string, string> = {
  a: "#0f172a",
  b: "#334155",
  c: "#22d3ee",
  d: "#a855f7",
  e: "#22c55e",
  f: "#e2e8f0",
  g: "#f472b6",
  h: "#cbd5e1",
  i: "#86efac",
  ".": "transparent",
};

const STATUS_TO_STAGE: Record<LeadStatus, StageId> = {
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

const STAGE_TO_STATUS: Record<StageId, LeadStatus> = {
  LEAD: "NO_RESPONSE",
  CONNECT: "CONNECTED",
  MESSAGE: "RESPONDED",
  CLOSE: "MEETING_BOOKED",
  REJECTED: "REJECTED",
};

const STATUS_LABELS: Record<StageId, string> = {
  LEAD: "SCAN",
  CONNECT: "LINK",
  MESSAGE: "PING",
  CLOSE: "LOCK",
  REJECTED: "DROP",
};

const AVATARS: PixelMap[] = ["avatarA", "avatarB", "avatarC", "avatarD"];

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setLeads(data);
          setSelectedLeadId((current) => current ?? data[0]?.id ?? null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const getStageId = (status: LeadStatus): StageId => STATUS_TO_STAGE[status] ?? "LEAD";

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? null;
  const selectedLeadStage = selectedLead ? getStageId(selectedLead.status) : null;

  const moveLead = async (lead: Lead, nextStage: StageId) => {
    const currentStage = getStageId(lead.status);
    const nextStatus = STAGE_TO_STATUS[nextStage];

    if (currentStage === nextStage || updatingLeadId) return;

    const previousStatus = lead.status;
    setUpdatingLeadId(lead.id);
    setLeads((current) =>
      current.map((item) =>
        item.id === lead.id ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() } : item
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
        current.map((item) => (item.id === lead.id ? { ...item, status: previousStatus } : item))
      );
    } finally {
      setUpdatingLeadId(null);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-sm border border-cyan-500/20 bg-[#050816] p-4 text-slate-100 shadow-[0_0_0_1px_rgba(6,182,212,0.08),0_0_60px_rgba(34,211,238,0.08)] sm:p-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(180deg, rgba(8,47,73,0.4), transparent 28%, rgba(17,24,39,0.15))",
          backgroundSize: "28px 28px, 28px 28px, 100% 100%",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            "repeating-linear-gradient(180deg, transparent 0px, transparent 3px, rgba(14,165,233,0.12) 4px)",
        }}
      />

      <div className="relative z-10 space-y-6">
        <header className="flex flex-col gap-4 border border-cyan-500/20 bg-slate-950/70 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p
              className="text-xs uppercase tracking-[0.35em] text-cyan-300/80"
              style={{ fontFamily: "var(--font-pixelify)" }}
            >
              PX-90 COMMAND GRID
            </p>
            <div>
              <h1
                className="text-2xl font-bold uppercase text-cyan-300 sm:text-3xl"
                style={{ fontFamily: "var(--font-pixelify)" }}
              >
                Lead Pipeline
              </h1>
              <p className="max-w-2xl text-sm text-slate-400">
                Route pixel agents from acquisition to close. Select a target on the map to inspect or advance it.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <HudChip label="Targets" value={String(leads.length)} tone="cyan" />
            <HudChip
              label="Closed"
              value={String(leads.filter((lead) => getStageId(lead.status) === "CLOSE").length)}
              tone="green"
            />
            <Link
              href="/leads/new"
              className="inline-flex items-center gap-2 border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-200 transition-colors hover:bg-cyan-400/20"
            >
              <Plus size={14} />
              Add Lead
            </Link>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_360px]">
          <section className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-5">
              {STAGES.map((stage, index) => {
                const stageLeads = leads.filter((lead) => getStageId(lead.status) === stage.id);
                const isActive = selectedLeadStage === stage.id;

                return (
                  <motion.section
                    key={stage.id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    className="relative"
                  >
                    <div
                      className="absolute inset-2 blur-2xl"
                      style={{ backgroundColor: stage.glow }}
                    />
                    <div
                      className="relative h-full border bg-slate-950/85 p-3"
                      style={{
                        borderColor: isActive ? stage.accent : stage.border,
                        boxShadow: isActive ? `0 0 0 1px ${stage.accent} inset` : undefined,
                      }}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <PixelSprite map={stage.icon} pixelSize={8} />
                            <div>
                              <p
                                className="text-lg uppercase"
                                style={{
                                  color: stage.accent,
                                  fontFamily: "var(--font-pixelify)",
                                }}
                              >
                                {stage.id}
                              </p>
                              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                                {stage.detail}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="border border-white/10 bg-slate-900/90 px-2 py-1 text-right">
                          <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Count</div>
                          <div
                            className="text-xl"
                            style={{
                              color: stage.accent,
                              fontFamily: "var(--font-pixelify)",
                            }}
                          >
                            {stageLeads.length}
                          </div>
                        </div>
                      </div>

                      <div className={`mb-3 h-2 w-full bg-gradient-to-r ${stage.rail}`} />

                      <div className="grid min-h-[320px] grid-cols-2 gap-2 rounded-sm border border-white/8 bg-slate-900/65 p-2">
                        {loading
                          ? Array.from({ length: 4 }).map((_, cellIndex) => (
                              <div
                                key={`${stage.id}-loading-${cellIndex}`}
                                className="h-20 animate-pulse border border-white/5 bg-slate-800/90"
                              />
                            ))
                          : (
                              <AnimatePresence>
                                {stageLeads.map((lead, leadIndex) => (
                                  <LeadTile
                                    key={lead.id}
                                    lead={lead}
                                    index={leadIndex}
                                    selected={selectedLeadId === lead.id}
                                    busy={updatingLeadId === lead.id}
                                    accent={stage.accent}
                                    onSelect={() => setSelectedLeadId(lead.id)}
                                  />
                                ))}
                              </AnimatePresence>
                            )}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        <span>Sector {index + 1}</span>
                        <span>{STATUS_LABELS[stage.id]}</span>
                      </div>
                    </div>

                    {index < STAGES.length - 1 ? (
                      <div className="pointer-events-none absolute -right-3 top-1/2 hidden -translate-y-1/2 lg:block">
                        <ArrowRight className="h-5 w-5 text-cyan-300/45" />
                      </div>
                    ) : null}
                  </motion.section>
                );
              })}
            </div>
          </section>

          <aside className="relative border border-fuchsia-400/20 bg-slate-950/85 p-4 backdrop-blur">
            <div className="absolute inset-3 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_48%)]" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <p
                    className="text-lg uppercase text-fuchsia-300"
                    style={{ fontFamily: "var(--font-pixelify)" }}
                  >
                    Lead Detail
                  </p>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Click any avatar on the map
                  </p>
                </div>
                {selectedLead ? (
                  <button
                    type="button"
                    onClick={() => setSelectedLeadId(null)}
                    className="border border-white/10 p-2 text-slate-400 transition-colors hover:text-white"
                    aria-label="Close detail panel"
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </div>

              {selectedLead ? (
                <motion.div
                  key={selectedLead.id}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  className="space-y-4"
                >
                  <div className="border border-cyan-400/20 bg-slate-900/80 p-3">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="border border-white/10 bg-slate-950/90 p-2">
                          <PixelSprite map={avatarForLead(selectedLead.id)} pixelSize={7} />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-slate-100">{selectedLead.company}</p>
                          <p className="text-sm text-slate-400">
                            {selectedLead.contact ?? "Unknown contact"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                          Priority
                        </div>
                        <div className="mt-1 inline-flex border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">
                          {selectedLead.priority}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm text-slate-300">
                      <DetailRow label="Status" value={getStageId(selectedLead.status)} />
                      <DetailRow label="Email" value={selectedLead.email ?? "No email"} />
                      <DetailRow label="Phone" value={selectedLead.phone ?? "No phone"} />
                      <DetailRow label="Source" value={selectedLead.source ?? "Unknown source"} />
                    </div>
                  </div>

                  <div className="border border-white/10 bg-slate-900/80 p-3">
                    <p
                      className="mb-3 text-sm uppercase text-cyan-300"
                      style={{ fontFamily: "var(--font-pixelify)" }}
                    >
                      Route Target
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {STAGES.map((stage) => {
                        const active = getStageId(selectedLead.status) === stage.id;

                        return (
                          <button
                            key={stage.id}
                            type="button"
                            onClick={() => moveLead(selectedLead, stage.id)}
                            disabled={active || updatingLeadId === selectedLead.id}
                            className="border px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                            style={{
                              borderColor: active ? stage.accent : stage.border,
                              backgroundColor: active ? stage.glow : "rgba(15,23,42,0.88)",
                              color: active ? stage.accent : "#e2e8f0",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span>{stage.id}</span>
                              <ChevronRight size={14} />
                            </div>
                            <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                              {STATUS_LABELS[stage.id]}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border border-white/10 bg-slate-900/80 p-3">
                    <p
                      className="mb-2 text-sm uppercase text-emerald-300"
                      style={{ fontFamily: "var(--font-pixelify)" }}
                    >
                      Notes
                    </p>
                    <p className="text-sm leading-6 text-slate-400">
                      {selectedLead.notes ?? "No tactical notes logged for this lead yet."}
                    </p>
                  </div>

                  <Link
                    href={`/leads/${selectedLead.id}`}
                    className="inline-flex items-center gap-2 border border-fuchsia-400/30 bg-fuchsia-400/10 px-3 py-2 text-sm text-fuchsia-200 transition-colors hover:bg-fuchsia-400/20"
                  >
                    <UserRound size={14} />
                    Open full lead record
                  </Link>
                </motion.div>
              ) : (
                <div className="border border-dashed border-white/10 bg-slate-900/60 p-6 text-center text-sm text-slate-500">
                  Select a pixel avatar from any station to inspect details and move it across the command map.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function LeadTile({
  lead,
  index,
  selected,
  busy,
  accent,
  onSelect,
}: {
  lead: Lead;
  index: number;
  selected: boolean;
  busy: boolean;
  accent: string;
  onSelect: () => void;
}) {
  return (
    <motion.button
      layout
      layoutId={`lead-${lead.id}`}
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 24,
        delay: index * 0.03,
      }}
      className="group relative border border-white/10 bg-slate-950/90 p-2 text-left transition-transform hover:-translate-y-0.5 hover:border-white/25"
      style={{
        boxShadow: selected ? `0 0 0 1px ${accent} inset, 0 0 22px rgba(34,211,238,0.08)` : undefined,
      }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <PixelSprite map={avatarForLead(lead.id)} pixelSize={5} />
        <span
          className="border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.2em]"
          style={{
            borderColor: busy ? accent : "rgba(148,163,184,0.18)",
            color: busy ? accent : "#94a3b8",
          }}
        >
          {lead.priority}
        </span>
      </div>
      <p className="truncate text-sm font-medium text-slate-100">{lead.company}</p>
      <p className="truncate text-xs uppercase tracking-[0.2em] text-slate-500">
        {lead.contact ?? "Unknown Contact"}
      </p>
      <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-500">
        <span>{STATUS_LABELS[STATUS_TO_STAGE[lead.status] ?? "LEAD"]}</span>
        <span>{busy ? "Moving" : "Ready"}</span>
      </div>
    </motion.button>
  );
}

function HudChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "green";
}) {
  const accent = tone === "green" ? "#22c55e" : "#22d3ee";

  return (
    <div className="border border-white/10 bg-slate-950/90 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{label}</div>
      <div
        className="text-lg"
        style={{
          color: accent,
          fontFamily: "var(--font-pixelify)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
      <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{label}</span>
      <span className="text-right text-slate-200">{value}</span>
    </div>
  );
}

function PixelSprite({
  map,
  pixelSize,
}: {
  map: PixelMap;
  pixelSize: number;
}) {
  const rows = PIXELS[map];

  return (
    <div
      aria-hidden="true"
      className="grid shrink-0"
      style={{
        gridTemplateColumns: `repeat(${rows[0].length}, ${pixelSize}px)`,
        gridAutoRows: `${pixelSize}px`,
      }}
    >
      {rows.flatMap((row, rowIndex) =>
        row.split("").map((cell, columnIndex) => (
          <span
            key={`${map}-${rowIndex}-${columnIndex}`}
            style={{
              width: pixelSize,
              height: pixelSize,
              backgroundColor: PIXEL_PALETTES[cell] ?? "transparent",
            }}
          />
        ))
      )}
    </div>
  );
}

function avatarForLead(leadId: string): PixelMap {
  const total = leadId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATARS[total % AVATARS.length];
}
