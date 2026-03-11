"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Linkedin,
  ExternalLink,
  Clock,
  Edit2,
  Trash2,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

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
  status: string;
  source: string | null;
  notes: string | null;
  messageDraft: string | null;
  messageSent: boolean;
  followUpAt: string | null;
  createdAt: string;
  updatedAt: string;
  activities: Activity[];
}

const STATUSES = ["LEAD", "CONNECT", "MESSAGE", "CLOSE"];
const PRIORITIES = ["HIGH", "MEDIUM", "LOW"];

const statusColors: Record<string, string> = {
  LEAD: "text-slate-300 border-slate-500",
  CONNECT: "text-blue-300 border-blue-500",
  MESSAGE: "text-purple-300 border-purple-500",
  CLOSE: "text-green-300 border-green-500",
};

const priorityColors: Record<string, string> = {
  HIGH: "text-red-400 border-red-500/40",
  MEDIUM: "text-amber-400 border-amber-500/40",
  LOW: "text-slate-400 border-slate-500/40",
};

const activityIcons: Record<string, string> = {
  NOTE: "📝",
  STATUS_CHANGE: "🔄",
  MESSAGE_SENT: "📤",
  EMAIL_SENT: "📧",
  FOLLOW_UP: "🔔",
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Lead>>({});

  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setLead(data);
        setForm(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load lead");
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const updated = await res.json();
      setLead(updated);
      setForm(updated);
      setEditing(false);
      toast.success("Lead updated");
    } catch {
      toast.error("Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this lead? This cannot be undone.")) return;
    try {
      await fetch(`/api/leads/${id}`, { method: "DELETE" });
      toast.success("Lead deleted");
      router.push("/");
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded-sm" />
        <div className="h-64 bg-slate-800 rounded-sm" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Lead not found.</p>
        <Link href="/" className="text-cyan-400 text-sm mt-2 inline-block hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const field = (key: keyof Lead) => (editing ? form[key] : lead[key]) as string | null | undefined;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors"
        >
          <ArrowLeft size={14} />
          Dashboard
        </Link>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={() => { setEditing(false); setForm(lead); }}
                className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 border border-slate-600 rounded-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 text-sm text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 border border-slate-600 rounded-sm transition-colors"
              >
                <Edit2 size={12} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 border border-red-500/30 rounded-sm transition-colors"
              >
                <Trash2 size={12} />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-sm p-4">
            {/* Company */}
            <div className="flex items-start justify-between mb-3">
              <div>
                {editing ? (
                  <input
                    className="text-2xl font-bold text-slate-100 bg-transparent border-b border-cyan-500 outline-none w-full"
                    value={form.company ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-slate-100">{lead.company}</h1>
                )}
                {editing ? (
                  <input
                    className="text-sm text-slate-400 bg-transparent border-b border-slate-600 outline-none mt-1 w-full"
                    value={form.contact ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                    placeholder="Contact name"
                  />
                ) : (
                  lead.contact && <p className="text-sm text-slate-400 mt-0.5">{lead.contact}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {editing ? (
                  <select
                    className="text-xs border rounded-sm px-2 py-1 bg-slate-700 border-slate-600 text-slate-200 outline-none"
                    value={form.priority ?? "MEDIUM"}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`text-xs border px-2 py-0.5 rounded-sm font-mono ${priorityColors[lead.priority] ?? priorityColors.MEDIUM}`}>
                    {lead.priority}
                  </span>
                )}
                {editing ? (
                  <select
                    className="text-xs border rounded-sm px-2 py-1 bg-slate-700 border-slate-600 text-slate-200 outline-none"
                    value={form.status ?? "LEAD"}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`text-xs border px-2 py-0.5 rounded-sm font-mono ${statusColors[lead.status] ?? ""}`}>
                    {lead.status}
                  </span>
                )}
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-700 pt-3">
              <ContactField
                icon={<Mail size={13} />}
                label="Email"
                value={field("email")}
                editing={editing}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                type="email"
              />
              <ContactField
                icon={<Phone size={13} />}
                label="Phone"
                value={field("phone")}
                editing={editing}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              />
              <ContactField
                icon={<Linkedin size={13} />}
                label="LinkedIn"
                value={field("linkedin")}
                editing={editing}
                onChange={(v) => setForm((f) => ({ ...f, linkedin: v }))}
                isLink
              />
              <ContactField
                icon={<ExternalLink size={13} />}
                label="Source"
                value={field("source")}
                editing={editing}
                onChange={(v) => setForm((f) => ({ ...f, source: v }))}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-slate-800 border border-slate-700 rounded-sm p-4">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-bold">Notes</h3>
            {editing ? (
              <textarea
                className="w-full bg-slate-700 border border-slate-600 rounded-sm p-2 text-sm text-slate-200 outline-none focus:border-cyan-500 min-h-[100px] resize-none"
                value={form.notes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Add notes..."
              />
            ) : (
              <p className="text-sm text-slate-300 whitespace-pre-wrap">
                {lead.notes || <span className="text-slate-500">No notes</span>}
              </p>
            )}
          </div>

          {/* Message Draft */}
          <div className="bg-slate-800 border border-slate-700 rounded-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <MessageSquare size={12} />
                Message Draft
              </h3>
              {lead.messageSent && (
                <span className="flex items-center gap-1 text-xs text-green-400 font-mono">
                  <CheckCircle size={11} />
                  Sent
                </span>
              )}
            </div>
            {editing ? (
              <textarea
                className="w-full bg-slate-700 border border-slate-600 rounded-sm p-2 text-sm text-slate-200 outline-none focus:border-cyan-500 min-h-[100px] resize-none"
                value={form.messageDraft ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, messageDraft: e.target.value }))}
                placeholder="Draft outreach message..."
              />
            ) : (
              <p className="text-sm text-slate-300 whitespace-pre-wrap">
                {lead.messageDraft || <span className="text-slate-500">No draft</span>}
              </p>
            )}
          </div>

          {/* Activity log */}
          <div className="bg-slate-800 border border-slate-700 rounded-sm p-4">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-3 font-bold">Activity Log</h3>
            {lead.activities.length === 0 ? (
              <p className="text-xs text-slate-500">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {lead.activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 border-l-2 border-slate-700 pl-3">
                    <span className="text-sm flex-shrink-0 mt-0.5">{activityIcons[act.type] ?? "•"}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-300">{act.note}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Timing */}
          <div className="bg-slate-800 border border-slate-700 rounded-sm p-4">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-3 font-bold flex items-center gap-2">
              <Clock size={12} />
              Timing
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-slate-500 text-xs">Created</p>
                <p className="text-slate-300 text-xs font-mono">
                  {format(new Date(lead.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Follow-up</p>
                {editing ? (
                  <input
                    type="datetime-local"
                    className="text-xs bg-slate-700 border border-slate-600 rounded-sm px-2 py-1 text-slate-200 outline-none w-full mt-1"
                    value={form.followUpAt ? form.followUpAt.slice(0, 16) : ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, followUpAt: e.target.value || null }))
                    }
                  />
                ) : lead.followUpAt ? (
                  <p className={`text-xs font-mono ${new Date(lead.followUpAt) < new Date() ? "text-red-400" : "text-slate-300"}`}>
                    {format(new Date(lead.followUpAt), "MMM d, yyyy HH:mm")}
                  </p>
                ) : (
                  <p className="text-slate-500 text-xs">Not set</p>
                )}
              </div>
            </div>
          </div>

          {/* Message status */}
          <div className="bg-slate-800 border border-slate-700 rounded-sm p-4">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-bold">Message Status</h3>
            {editing ? (
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.messageSent}
                  onChange={(e) => setForm((f) => ({ ...f, messageSent: e.target.checked }))}
                  className="accent-cyan-400"
                />
                Message sent
              </label>
            ) : (
              <span className={`text-sm ${lead.messageSent ? "text-green-400" : "text-slate-500"}`}>
                {lead.messageSent ? "✓ Sent" : "Not sent"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactField({
  icon,
  label,
  value,
  editing,
  onChange,
  type = "text",
  isLink = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  editing: boolean;
  onChange: (v: string) => void;
  type?: string;
  isLink?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      {editing ? (
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">{icon}</span>
          <input
            type={type}
            className="text-sm text-slate-200 bg-transparent border-b border-slate-600 outline-none focus:border-cyan-500 w-full"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={label}
          />
        </div>
      ) : value ? (
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">{icon}</span>
          {isLink ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cyan-400 hover:underline truncate"
            >
              {value}
            </a>
          ) : (
            <span className="text-sm text-slate-300 truncate">{value}</span>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-600">—</p>
      )}
    </div>
  );
}
