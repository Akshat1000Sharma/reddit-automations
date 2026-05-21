"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { automationsApi } from "@/lib/api";
import { Automation } from "@/types/automation";
import { useAuth } from "@/lib/auth-context";
import { Plus, Zap, Clock, CheckCircle, AlertCircle, Pause, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { user } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    automationsApi.list()
      .then((res) => setAutomations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: automations.length,
    active: automations.filter((a) => a.status === "active").length,
    completed: automations.filter((a) => a.status === "completed").length,
    failed: automations.filter((a) => a.status === "failed").length,
  };

  const recentRuns = automations
    .filter((a) => a.last_run_at)
    .sort((a, b) => new Date(b.last_run_at!).getTime() - new Date(a.last_run_at!).getTime())
    .slice(0, 5);

  return (
    <div style={{ padding: "40px 40px 60px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
          Good day, {user?.email?.split("@")[0]} 👋
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Here&apos;s your automation overview</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 36 }}>
        {[
          { label: "Total", value: stats.total, icon: Zap, color: "var(--reddit-orange)", bg: "rgba(255,69,0,0.08)" },
          { label: "Active", value: stats.active, icon: Activity, color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "#60a5fa", bg: "rgba(96,165,250,0.08)" },
          { label: "Failed", value: stats.failed, icon: AlertCircle, color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)", lineHeight: 1 }}>{loading ? "—" : stat.value}</p>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Quick Actions */}
        <div className="card">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { href: "/dashboard/automations/new?type=scheduled_post", label: "Schedule a Post", desc: "Post to a subreddit at a set time", color: "var(--reddit-orange)" },
              { href: "/dashboard/automations/new?type=auto_reply", label: "Auto Reply Setup", desc: "Reply to a specific post automatically", color: "#60a5fa" },
              { href: "/dashboard/automations/new?type=keyword_reply", label: "Keyword Monitor", desc: "Reply when keywords appear in comments", color: "#22c55e" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  background: "var(--surface)",
                  borderRadius: 8,
                  textDecoration: "none",
                  border: "1px solid var(--border)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = action.color; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
              >
                <Plus size={18} color={action.color} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{action.label}</p>
                  <p style={{ fontSize: 11, color: "var(--muted)" }}>{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Recent Activity</h2>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="shimmer" style={{ height: 48, borderRadius: 8 }} />
              ))}
            </div>
          ) : recentRuns.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <Clock size={32} color="var(--muted)" style={{ margin: "0 auto 10px" }} />
              <p style={{ color: "var(--muted)", fontSize: 13 }}>No activity yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentRuns.map((a) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface)", borderRadius: 8 }}>
                  {a.status === "failed" ? <AlertCircle size={14} color="#ef4444" /> :
                    a.status === "paused" ? <Pause size={14} color="#eab308" /> :
                    <CheckCircle size={14} color="#22c55e" />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</p>
                    <p style={{ fontSize: 11, color: "var(--muted)" }}>
                      {formatDistanceToNow(new Date(a.last_run_at!), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
