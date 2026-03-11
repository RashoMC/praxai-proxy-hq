"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Lead {
  id: string;
  company: string;
  contact: string | null;
  status: string;
  priority: string;
  followUpAt: string;
}

export default function FollowUps() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/followups/due")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLeads(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-sm p-4">
      <h2 className="text-slate-100 text-base font-bold mb-3 flex items-center gap-2">
        <Clock size={14} className="text-amber-400" />
        <span>Follow-ups</span>
        {leads.length > 0 && (
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-sm font-mono">
            {leads.length}
          </span>
        )}
      </h2>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 bg-slate-700 animate-pulse rounded-sm" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <p className="text-xs text-slate-500 py-2">No upcoming follow-ups</p>
      ) : (
        <div className="space-y-2">
          {leads.slice(0, 5).map((lead) => {
            const isOverdue = new Date(lead.followUpAt) < new Date();
            return (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="block bg-slate-700/50 border border-slate-600 rounded-sm p-2.5 hover:border-slate-500 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{lead.company}</p>
                    {lead.contact && (
                      <p className="text-[10px] text-slate-400 truncate">{lead.contact}</p>
                    )}
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[10px] font-mono flex-shrink-0 ${
                      isOverdue ? "text-red-400" : "text-slate-400"
                    }`}
                  >
                    {isOverdue && <AlertCircle size={10} />}
                    {formatDistanceToNow(new Date(lead.followUpAt), { addSuffix: true })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
