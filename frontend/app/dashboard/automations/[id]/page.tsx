"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { automationsApi } from "@/lib/api";
import { Automation, AUTOMATION_TYPE_LABELS, STATUS_COLORS } from "@/types/automation";
import toast from "react-hot-toast";
import { ArrowLeft, Play, Pause, Trash2, RefreshCw, Clock, Calendar, Hash } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function AutomationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    automationsApi.get(Number(id))
      .then((res) => setAutomation(res.data))
      .catch(() => toast.error("Automation not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRunNow = async () => {
    setActionLoading(true);
    try {
      const res = await automationsApi.runNow(Number(id));
      setAutomation(res.data.automation);
      toast.success("Executed!");
    } catch { toast.error("Execution failed"); }
    finally { setActionLoading(false); }
  };

  const handleToggle = async () => {
    if (!automation) return;
    setActionLoading(true);
    try {
      if (automation.status === "active") {
        await automationsApi.pause(automation.id);
        toast.success("Paused");
      } else {
        await automationsApi.resume(automation.id);
        toast.success("Resumed");
      }
      const res = await automationsApi.get(Number(id));
      setAutomation(res.data);
    } catch { toast.error("Failed"); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!automation || !confirm("Delete this automation?")) return;
    try {
      await automationsApi.delete(automation.id);
      toast.success("Deleted");
      router.push("/dashboard/automations");
    } catch { toast.error("Delete failed"); }
  };

  if (loading) return (
    <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--surface)", borderTop: "3px solid var(--reddit-orange)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!automation) return null;

  const Row = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number | undefined | null }) => value ? (
    <div style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ width: 130, display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", fontSize: 13 }}>
        <Icon size={14} />{label}
      </div>
      <span style={{ fontSize: 13, color: "var(--text)", flex: 1 }}>{value}</span>
    </div>
  ) : null;

  return (
    <div style={{ padding: "40px", maxWidth: 700 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <Link href="/dashboard/automations" className="btn btn-ghost" style={{ padding: "8px 10px" }}>
          <ArrowLeft size={16} />
        </Link>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text)", flex: 1 }}>
          {automation.name}
        </h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={handleRunNow} disabled={actionLoading}>
            <Play size={14} /> Run now
          </button>
          <button className="btn btn-secondary" onClick={handleToggle} disabled={actionLoading}>
            {automation.status === "active" ? <><Pause size={14} /> Pause</> : <><RefreshCw size={14} /> Resume</>}
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Status */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        <span className={`badge ${STATUS_COLORS[automation.status]}`}>{automation.status}</span>
        <span style={{ fontSize: 12, color: "var(--muted)", background: "var(--surface)", padding: "3px 8px", borderRadius: 100, border: "1px solid var(--border)" }}>
          {AUTOMATION_TYPE_LABELS[automation.automation_type]}
        </span>
        {automation.is_recurring && (
          <span style={{ fontSize: 12, color: "#60a5fa", background: "rgba(96,165,250,0.1)", padding: "3px 8px", borderRadius: 100 }}>
            Recurring
          </span>
        )}
      </div>

      {/* Error */}
      {automation.last_error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "12px 14px", marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, marginBottom: 4 }}>Last Error</p>
          <p style={{ fontSize: 12, color: "#fca5a5", fontFamily: "var(--font-mono)" }}>{automation.last_error}</p>
        </div>
      )}

      {/* Details */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Configuration</h3>
        <Row icon={Hash} label="Subreddit" value={automation.subreddit ? `r/${automation.subreddit}` : null} />
        <Row icon={Calendar} label="Scheduled" value={automation.scheduled_at ? format(new Date(automation.scheduled_at), "PPpp") : null} />
        <Row icon={RefreshCw} label="Cron" value={automation.cron_expression} />
        <Row icon={Clock} label="Post Title" value={automation.post_title} />
        <Row icon={Clock} label="Post Type" value={automation.post_type} />
        {automation.post_content && (
          <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Post Content</p>
            <p style={{ fontSize: 13, color: "var(--text)", whiteSpace: "pre-wrap" }}>{automation.post_content}</p>
          </div>
        )}
        <Row icon={Clock} label="Post URL" value={automation.post_url} />
        <Row icon={Clock} label="Post ID" value={automation.reply_to_post_id} />
        <Row icon={Clock} label="Keyword" value={automation.trigger_keyword} />
        {automation.reply_template && (
          <div style={{ padding: "12px 0" }}>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Reply Template</p>
            <p style={{ fontSize: 13, color: "var(--text)", whiteSpace: "pre-wrap" }}>{automation.reply_template}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Stats</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Total Runs", value: automation.run_count },
            { label: "Last Run", value: automation.last_run_at ? formatDistanceToNow(new Date(automation.last_run_at), { addSuffix: true }) : "Never" },
            { label: "Created", value: automation.created_at ? format(new Date(automation.created_at), "MMM d, yyyy") : "—" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "var(--surface)", borderRadius: 8, padding: "12px 14px" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>{stat.value}</p>
              <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
