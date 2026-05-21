export type AutomationType = "scheduled_post" | "auto_reply" | "keyword_reply" | "scheduled_comment";
export type AutomationStatus = "active" | "paused" | "completed" | "failed";
export type PostType = "text" | "link";

export interface Automation {
  id: number;
  name: string;
  automation_type: AutomationType;
  status: AutomationStatus;
  subreddit?: string;
  scheduled_at?: string;
  cron_expression?: string;
  is_recurring: boolean;
  post_title?: string;
  post_content?: string;
  post_type: PostType;
  post_url?: string;
  reply_template?: string;
  trigger_keyword?: string;
  reply_to_post_id?: string;
  last_run_at?: string;
  next_run_at?: string;
  run_count: number;
  last_error?: string;
  created_at?: string;
  config?: Record<string, unknown>;
}

export const AUTOMATION_TYPE_LABELS: Record<AutomationType, string> = {
  scheduled_post: "Scheduled Post",
  auto_reply: "Auto Reply",
  keyword_reply: "Keyword Reply",
  scheduled_comment: "Scheduled Comment",
};

export const AUTOMATION_TYPE_DESCRIPTIONS: Record<AutomationType, string> = {
  scheduled_post: "Post to a subreddit at a specific time or on a recurring schedule",
  auto_reply: "Automatically reply to a specific Reddit post",
  keyword_reply: "Monitor a subreddit and reply to comments containing a keyword",
  scheduled_comment: "Post a comment on an existing post at a scheduled time",
};

export const STATUS_COLORS: Record<AutomationStatus, string> = {
  active: "text-green-400 bg-green-400/10",
  paused: "text-yellow-400 bg-yellow-400/10",
  completed: "text-blue-400 bg-blue-400/10",
  failed: "text-red-400 bg-red-400/10",
};
