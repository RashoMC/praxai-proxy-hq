"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["LEAD", "CONNECT", "MESSAGE", "CLOSE"];
const PRIORITIES = ["HIGH", "MEDIUM", "LOW"];
const SOURCES = ["LinkedIn", "Referral", "Cold Email", "Conference", "Inbound", "Other"];

interface FormData {
  company: string;
  contact: string;
  email: string;
  linkedin: string;
  phone: string;
  priority: string;
  status: string;
  source: string;
  notes: string;
  messageDraft: string;
  followUpAt: string;
}

const DEFAULT_FORM: FormData = {
  company: "",
  contact: "",
  email: "",
  linkedin: "",
  phone: "",
  priority: "MEDIUM",
  status: "LEAD",
  source: "",
  notes: "",
  messageDraft: "",
  followUpAt: "",
};

export default function NewLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim()) {
      toast.error("Company name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          followUpAt: form.followUpAt || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const lead = await res.json();
      toast.success("Lead created!");
      router.push(`/leads/${lead.id}`);
    } catch {
      toast.error("Failed to create lead");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors"
        >
          <ArrowLeft size={14} />
          Dashboard
        </Link>
        <span className="text-slate-600">/</span>
        <h1
          className="text-base font-bold text-cyan-400"
          style={{ fontFamily: "var(--font-pixelify)" }}
        >
          NEW LEAD
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Core info */}
        <div className="bg-slate-800 border border-slate-700 rounded-sm p-4 space-y-4">
          <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Core Info</h2>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider">Company *</label>
            <input
              className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-sm px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500 transition-colors"
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="Acme Corp"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider">Contact Name</label>
              <input
                className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-sm px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500 transition-colors"
                value={form.contact}
                onChange={(e) => set("contact", e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider">Email</label>
              <input
                type="email"
                className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-sm px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500 transition-colors"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="john@acme.com"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider">Phone</label>
              <input
                className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-sm px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500 transition-colors"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider">LinkedIn</label>
              <input
                className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-sm px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500 transition-colors"
                value={form.linkedin}
                onChange={(e) => set("linkedin", e.target.value)}
                placeholder="linkedin.com/in/johndoe"
              />
            </div>
          </div>
        </div>

        {/* Pipeline */}
        <div className="bg-slate-800 border border-slate-700 rounded-sm p-4 space-y-4">
          <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Pipeline</h2>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider">Status</label>
              <select
                className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-sm px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider">Priority</label>
              <select
                className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-sm px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500"
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider">Source</label>
              <select
                className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-sm px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500"
                value={form.source}
                onChange={(e) => set("source", e.target.value)}
              >
                <option value="">Select...</option>
                {SOURCES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider">Follow-up Date</label>
            <input
              type="datetime-local"
              className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-sm px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500"
              value={form.followUpAt}
              onChange={(e) => set("followUpAt", e.target.value)}
            />
          </div>
        </div>

        {/* Notes + Message */}
        <div className="bg-slate-800 border border-slate-700 rounded-sm p-4 space-y-4">
          <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Notes & Outreach</h2>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider">Notes</label>
            <textarea
              className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-sm px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500 min-h-[80px] resize-none"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Background info, context, research..."
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider">Message Draft</label>
            <textarea
              className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-sm px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500 min-h-[80px] resize-none"
              value={form.messageDraft}
              onChange={(e) => set("messageDraft", e.target.value)}
              placeholder="Draft outreach message..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/"
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 border border-slate-600 rounded-sm transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 text-sm font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-sm transition-colors disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Lead"}
          </button>
        </div>
      </form>
    </div>
  );
}
