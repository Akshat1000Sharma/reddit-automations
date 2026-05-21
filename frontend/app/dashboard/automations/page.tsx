"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { automationsApi } from "@/lib/api";
import { Automation, AUTOMATION_TYPE_LABELS, STATUS_COLORS } from "@/types/automation";
import toast from "react-hot-toast";
import { Plus, Play, Pause, Trash2, Eye, RefreshCw, AlertCircle, ChevronRight } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchAutomations = async () => {
    try {
      const res = await automationsApi.list();
      setAutomations(res.data);
    } catch {
      toast.error("Failed to load automations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAutomations(); }, []);

  const handleRunNow = async (id: number) => {
    setActionLoading(id);
    try {
      await automationsApi.runNow(id);
      toast.success("Automation executed!");
      fetchAutomations();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Execution failed";
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePause = async (id: number) => {
    setActionLoading(id);
    try {
      await automationsApi.pause(id);
      toast.success("Automation paused");
      fetchAutomations();
    } catch { toast.error("Failed to pause"); }
    finally { setActionLoading(null); }
  };

  const handleResume = async (id: number) => {
    setActionLoading(id);
    try {
      await automationsApi.resume(id);
      toast.success("Automation resumed");
      fetchAutomations();
    } catch { toast.error("Failed to resume"); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this automation?")) return;
    setActionLoading(id);
    try {
      await automationsApi.delete(id);
      toast.success("Automation deleted");
      setAutomations((prev) => prev.filter((a) => a.id !== id));
    } catch { toast.error("Failed to delete"); }
    finally { setActionLoading(null); }
  };

  return (
    <div style={{ padding: "40px 40px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
            Automations
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>{automations.length} automation{automations.length !== 1 ? "s" : ""} configured</p>
        </div>
        <Link href="/dashboard/automations/new" className="btn btn-primary">
          <Plus size={16} /> New Automation
        </Link>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => <div key={i} className="shimmer" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
      ) : automations.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "80px 20px",
          background: "var(--dark)",
          borderRadius: 16,
          border: "1px dashed var(--border)",
        }}>
          <div style={{ width: 56, height: 56, background: "rgba(255,69,0,0.08)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <RefreshCw size={24} color="var(--reddit-orange)" />
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>No automations yet</h3>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>Create your first Reddit automation to get started</p>
          <Link href="/dashboard/automations/new" className="btn btn-primary">
            <Plus size={16} /> Create Automation
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {automations.map((automation) => {
            const isLoading = actionLoading === automation.id;
            return (
              <div key={automation.id} className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {/* Type badge + info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span className={`badge ${STATUS_COLORS[automation.status]}`}>
                      {automation.status}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--muted)", background: "var(--surface)", padding: "2px 8px", borderRadius: 100, border: "1px solid var(--border)" }}>
                      {AUTOMATION_TYPE_LABELS[automation.automation_type]}
                    </span>
                    {automation.is_recurring && (
                      <span style={{ fontSize: 11, color: "#60a5fa", background: "rgba(96,165,250,0.1)", padding: "2px 8px", borderRadius: 100 }}>
                        Recurring
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {automation.name}
                  </h3>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--muted)" }}>
                    {automation.subreddit && <span>r/{automation.subreddit}</span>}
                    {automation.scheduled_at && !automation.is_recurring && (
                      <span>Scheduled: {format(new Date(automation.scheduled_at), "MMM d, h:mm a")}</span>
                    )}
                    {automation.is_recurring && automation.cron_expression && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{automation.cron_expression}</span>
                    )}
                    {automation.last_run_at && (
                      <span>Last run: {formatDistanceToNow(new Date(automation.last_run_at), { addSuffix: true })}</span>
                    )}
                    <span>Runs: {automation.run_count}</span>
                  </div>
                  {automation.last_error && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <AlertCircle size={12} color="#ef4444" />
                      <span style={{ fontSize: 11, color: "#ef4444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{automation.last_error}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => handleRunNow(automation.id)}
                    disabled={isLoading}
                    title="Run now"
                    style={{ padding: "7px 10px" }}
                  >
                    <Play size={14} />
                  </button>
                  {automation.status === "active" ? (
                    <button className="btn btn-ghost" onClick={() => handlePause(automation.id)} disabled={isLoading} title="Pause" style={{ padding: "7px 10px" }}>
                      <Pause size={14} />
                    </button>
                  ) : automation.status === "paused" ? (
                    <button className="btn btn-ghost" onClick={() => handleResume(automation.id)} disabled={isLoading} title="Resume" style={{ padding: "7px 10px", color: "#22c55e" }}>
                      <Play size={14} />
                    </button>
                  ) : null}
                  <Link href={`/dashboard/automations/${automation.id}`} className="btn btn-ghost" style={{ padding: "7px 10px" }} title="View">
                    <Eye size={14} />
                  </Link>
                  <button className="btn btn-danger" onClick={() => handleDelete(automation.id)} disabled={isLoading} title="Delete" style={{ padding: "7px 10px" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <ChevronRight size={14} color="var(--border)" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
