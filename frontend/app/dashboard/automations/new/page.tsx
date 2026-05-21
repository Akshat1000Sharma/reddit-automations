"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { automationsApi } from "@/lib/api";
import { AutomationType, AUTOMATION_TYPE_LABELS, AUTOMATION_TYPE_DESCRIPTIONS } from "@/types/automation";
import toast from "react-hot-toast";
import { ArrowLeft, Calendar, MessageSquare, Search, FileText, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";

const TYPE_ICONS = {
  scheduled_post: FileText,
  auto_reply: MessageSquare,
  keyword_reply: Search,
  scheduled_comment: Calendar,
};

const TYPE_COLORS = {
  scheduled_post: "var(--reddit-orange)",
  auto_reply: "#60a5fa",
  keyword_reply: "#22c55e",
  scheduled_comment: "#a78bfa",
};

function NewAutomationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedType = searchParams.get("type") as AutomationType | null;

  const [step, setStep] = useState(preselectedType ? 2 : 1);
  const [automationType, setAutomationType] = useState<AutomationType | null>(preselectedType);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    subreddit: "",
    is_recurring: false,
    scheduled_at: "",
    cron_expression: "",
    post_title: "",
    post_content: "",
    post_type: "text",
    post_url: "",
    reply_template: "",
    trigger_keyword: "",
    reply_to_post_id: "",
  });

  const update = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!automationType) return;
    if (!form.name.trim()) return toast.error("Please enter a name");

    const payload: Record<string, unknown> = {
      name: form.name,
      automation_type: automationType,
      subreddit: form.subreddit || undefined,
      is_recurring: form.is_recurring,
    };

    if (form.is_recurring) {
      if (!form.cron_expression) return toast.error("Please enter a cron expression");
      payload.cron_expression = form.cron_expression;
    } else if (form.scheduled_at) {
      payload.scheduled_at = new Date(form.scheduled_at).toISOString();
    }

    if (automationType === "scheduled_post" || automationType === "scheduled_comment") {
      if (!form.post_title) return toast.error("Post title is required");
      payload.post_title = form.post_title;
      payload.post_type = form.post_type;
      if (form.post_type === "text") payload.post_content = form.post_content;
      else payload.post_url = form.post_url;
    }

    if (automationType === "auto_reply") {
      if (!form.reply_to_post_id) return toast.error("Post ID is required");
      if (!form.reply_template) return toast.error("Reply text is required");
      payload.reply_to_post_id = form.reply_to_post_id;
      payload.reply_template = form.reply_template;
    }

    if (automationType === "keyword_reply") {
      if (!form.trigger_keyword) return toast.error("Keyword is required");
      if (!form.reply_template) return toast.error("Reply template is required");
      payload.trigger_keyword = form.trigger_keyword;
      payload.reply_template = form.reply_template;
    }

    setLoading(true);
    try {
      await automationsApi.create(payload);
      toast.success("Automation created!");
      router.push("/dashboard/automations");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to create";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <Link href="/dashboard/automations" className="btn btn-ghost" style={{ padding: "8px 10px" }}>
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text)" }}>
            New Automation
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Step {step} of 2</p>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: "flex", gap: 6, marginBottom: 36 }}>
        {[1, 2].map((s) => (
          <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= s ? "var(--reddit-orange)" : "var(--border)", transition: "background 0.3s" }} />
        ))}
      </div>

      {/* Step 1: Choose type */}
      {step === 1 && (
        <div className="animate-slide-up">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
            Choose Automation Type
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>What do you want to automate?</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
            {(Object.keys(AUTOMATION_TYPE_LABELS) as AutomationType[]).map((type) => {
              const Icon = TYPE_ICONS[type];
              const color = TYPE_COLORS[type];
              const selected = automationType === type;
              return (
                <button
                  key={type}
                  onClick={() => setAutomationType(type)}
                  style={{
                    padding: "18px 20px",
                    borderRadius: 10,
                    border: `2px solid ${selected ? color : "var(--border)"}`,
                    background: selected ? `${color}10` : "var(--dark)",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                    <Icon size={18} color={color} />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{AUTOMATION_TYPE_LABELS[type]}</p>
                  <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{AUTOMATION_TYPE_DESCRIPTIONS[type]}</p>
                </button>
              );
            })}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => automationType && setStep(2)}
            disabled={!automationType}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Configuration */}
      {step === 2 && automationType && (
        <div className="animate-slide-up">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            {(() => { const Icon = TYPE_ICONS[automationType]; return <Icon size={18} color={TYPE_COLORS[automationType]} />; })()}
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
              Configure {AUTOMATION_TYPE_LABELS[automationType]}
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Automation Name *</label>
              <input className="input-dark" placeholder="e.g. Daily post to r/programming" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>

            {/* Subreddit */}
            {(automationType !== "auto_reply") && (
              <div className="form-group">
                <label className="form-label">Subreddit</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14 }}>r/</span>
                  <input className="input-dark" style={{ paddingLeft: 28 }} placeholder="AskReddit" value={form.subreddit} onChange={(e) => update("subreddit", e.target.value)} />
                </div>
              </div>
            )}

            {/* Schedule */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <Clock size={16} color="var(--muted)" />
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Schedule</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <button
                    onClick={() => update("is_recurring", false)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "1px solid",
                      borderColor: !form.is_recurring ? "var(--reddit-orange)" : "var(--border)",
                      background: !form.is_recurring ? "rgba(255,69,0,0.1)" : "transparent",
                      color: !form.is_recurring ? "var(--reddit-orange)" : "var(--muted)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >One-time</button>
                  <button
                    onClick={() => update("is_recurring", true)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "1px solid",
                      borderColor: form.is_recurring ? "var(--reddit-orange)" : "var(--border)",
                      background: form.is_recurring ? "rgba(255,69,0,0.1)" : "transparent",
                      color: form.is_recurring ? "var(--reddit-orange)" : "var(--muted)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <RefreshCw size={11} />Recurring
                  </button>
                </div>
              </div>
              {form.is_recurring ? (
                <div>
                  <label className="form-label" style={{ marginBottom: 6, display: "block" }}>Cron Expression</label>
                  <input
                    className="input-dark"
                    placeholder="0 9 * * 1  (every Monday at 9am)"
                    value={form.cron_expression}
                    onChange={(e) => update("cron_expression", e.target.value)}
                    style={{ fontFamily: "var(--font-mono)" }}
                  />
                  <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>Format: minute hour day month weekday</p>
                </div>
              ) : (
                <div>
                  <label className="form-label" style={{ marginBottom: 6, display: "block" }}>Schedule Date & Time</label>
                  <input
                    type="datetime-local"
                    className="input-dark"
                    value={form.scheduled_at}
                    onChange={(e) => update("scheduled_at", e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Post fields */}
            {(automationType === "scheduled_post" || automationType === "scheduled_comment") && (
              <>
                <div className="form-group">
                  <label className="form-label">Post Title *</label>
                  <input className="input-dark" placeholder="Enter post title..." value={form.post_title} onChange={(e) => update("post_title", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Post Type</label>
                  <select className="input-dark" value={form.post_type} onChange={(e) => update("post_type", e.target.value)}>
                    <option value="text">Text Post</option>
                    <option value="link">Link Post</option>
                  </select>
                </div>
                {form.post_type === "text" ? (
                  <div className="form-group">
                    <label className="form-label">Post Content</label>
                    <textarea className="input-dark" placeholder="Write your post content..." rows={5} value={form.post_content} onChange={(e) => update("post_content", e.target.value)} />
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">URL *</label>
                    <input className="input-dark" placeholder="https://example.com" type="url" value={form.post_url} onChange={(e) => update("post_url", e.target.value)} />
                  </div>
                )}
              </>
            )}

            {/* Auto reply fields */}
            {automationType === "auto_reply" && (
              <>
                <div className="form-group">
                  <label className="form-label">Reddit Post ID *</label>
                  <input className="input-dark" placeholder="e.g. abc123 (from post URL)" value={form.reply_to_post_id} onChange={(e) => update("reply_to_post_id", e.target.value)} style={{ fontFamily: "var(--font-mono)" }} />
                  <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Find the post ID in the URL: reddit.com/r/sub/comments/[POST_ID]/</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Reply Text *</label>
                  <textarea className="input-dark" placeholder="What should I reply?" rows={4} value={form.reply_template} onChange={(e) => update("reply_template", e.target.value)} />
                </div>
              </>
            )}

            {/* Keyword reply fields */}
            {automationType === "keyword_reply" && (
              <>
                <div className="form-group">
                  <label className="form-label">Trigger Keyword *</label>
                  <input className="input-dark" placeholder="e.g. help, question, anyone know" value={form.trigger_keyword} onChange={(e) => update("trigger_keyword", e.target.value)} />
                  <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Monitors new comments in the subreddit for this keyword</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Reply Template *</label>
                  <textarea className="input-dark" placeholder="Auto-reply message when keyword is found..." rows={4} value={form.reply_template} onChange={(e) => update("reply_template", e.target.value)} />
                </div>
              </>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 0 }}>
                <ArrowLeft size={14} /> Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{ flex: 1, justifyContent: "center" }}
              >
                {loading ? "Creating..." : "Create Automation"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  );
}

export default function NewAutomationPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "var(--muted)" }}>Loading...</div>}>
      <NewAutomationContent />
    </Suspense>
  );
}
