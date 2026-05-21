"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) router.replace("/dashboard");
      else router.replace("/auth/login");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--darker)" }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full animate-spin"
          style={{
            border: "3px solid var(--surface)",
            borderTop: "3px solid var(--reddit-orange)",
          }}
        />
        <p style={{ color: "var(--muted)", fontFamily: "var(--font-sans)", fontSize: "14px" }}>
          Loading...
        </p>
      </div>
    </div>
  );
}
