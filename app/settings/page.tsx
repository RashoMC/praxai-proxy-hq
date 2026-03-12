"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Key, Save, Eye, EyeOff, CheckCircle2, Zap } from "lucide-react";

export default function SettingsPage() {
  const [instantlyKey, setInstantlyKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.instantlyApiKey) setInstantlyKey(data.instantlyApiKey);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instantlyApiKey: instantlyKey }),
      });
      if (!res.ok) throw new Error("Failed");
      setSaved(true);
      toast.success("Settings saved");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const maskedKey = instantlyKey
    ? instantlyKey.slice(0, 8) + "•".repeat(Math.max(0, instantlyKey.length - 12)) + instantlyKey.slice(-4)
    : "";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1
          className="text-xl font-bold text-cyan-400 mb-1"
          style={{ fontFamily: "var(--font-pixelify)" }}
        >
          {"// SETTINGS"}
        </h1>
        <p className="text-sm text-slate-400">Configure API keys and integrations</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/30 rounded-sm flex items-center justify-center">
            <Zap size={16} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-200">Instantly.ai</h2>
            <p className="text-xs text-slate-400">Email outreach automation</p>
          </div>
          {instantlyKey && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-400 font-mono">
              <CheckCircle2 size={11} />
              Connected
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Key size={11} />
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                className="w-full bg-slate-700 border border-slate-600 rounded-sm px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500 transition-colors pr-10 font-mono"
                value={instantlyKey}
                onChange={(e) => setInstantlyKey(e.target.value)}
                placeholder="Paste your Instantly API key..."
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {instantlyKey && !showKey && (
              <p className="text-[10px] text-slate-500 mt-1 font-mono">{maskedKey}</p>
            )}
          </div>

          <div className="bg-slate-700/40 border border-slate-600 rounded-sm p-3 text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-1">How to get your API key:</p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>Log in to your Instantly.ai account</li>
              <li>Go to Settings → API</li>
              <li>Copy your API key and paste it above</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700/50 rounded-sm p-5 opacity-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-700 border border-slate-600 rounded-sm flex items-center justify-center">
            <span className="text-sm">📨</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-300">Apollo.io</h2>
            <p className="text-xs text-slate-500">Lead enrichment — coming soon</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700/50 rounded-sm p-5 opacity-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-700 border border-slate-600 rounded-sm flex items-center justify-center">
            <span className="text-sm">🔗</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-300">LinkedIn</h2>
            <p className="text-xs text-slate-500">Direct outreach — coming soon</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-sm transition-colors disabled:opacity-50"
        >
          {saved ? (
            <>
              <CheckCircle2 size={14} />
              Saved!
            </>
          ) : (
            <>
              <Save size={14} />
              {saving ? "Saving..." : "Save Settings"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
