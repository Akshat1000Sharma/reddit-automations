"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, Zap, Plus, LogOut, ChevronRight } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/automations", label: "Automations", icon: Zap },
  { href: "/dashboard/automations/new", label: "New Automation", icon: Plus },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside style={{
      width: 240,
      minHeight: "100vh",
      background: "var(--dark)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            background: "var(--reddit-orange)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Zap size={18} fill="white" color="white" />
          </div>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text)",
          }}>RedditBot</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        <div style={{ marginBottom: 4 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "6px 10px", marginBottom: 4 }}>
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 8,
                  marginBottom: 2,
                  color: active ? "white" : "var(--muted)",
                  background: active ? "var(--reddit-orange)" : "transparent",
                  textDecoration: "none",
                  fontSize: 13.5,
                  fontWeight: 500,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--muted)";
                  }
                }}
              >
                <Icon size={16} />
                {item.label}
                {active && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
        <div style={{
          padding: "10px",
          borderRadius: 8,
          background: "var(--surface)",
          marginBottom: 6,
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
            {user?.email?.split("@")[0]}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.email}
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 10px",
            borderRadius: 8,
            background: "transparent",
            border: "none",
            color: "var(--muted)",
            cursor: "pointer",
            fontSize: 13.5,
            fontWeight: 500,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)";
            (e.currentTarget as HTMLElement).style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--muted)";
          }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
