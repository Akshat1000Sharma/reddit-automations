"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";
import { Eye, EyeOff, Zap } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill all fields");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card animate-slide-up">
        <div className="auth-logo">
          <div className="logo-icon">
            <Zap size={22} fill="white" color="white" />
          </div>
          <span className="logo-text">RedditBot</span>
        </div>
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">Automate your Reddit presence</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="input-dark"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="input-dark"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: "44px" }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="auth-link">Create one</Link>
        </p>
      </div>
      <style jsx>{`
        .auth-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--darker);
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .auth-wrapper::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,69,0,0.06) 0%, transparent 70%);
          top: -200px;
          right: -200px;
          pointer-events: none;
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          background: var(--dark);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 40px;
          position: relative;
          z-index: 1;
        }
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }
        .logo-icon {
          width: 36px;
          height: 36px;
          background: var(--reddit-orange);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-text {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }
        .auth-title {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 6px;
        }
        .auth-subtitle {
          color: var(--muted);
          font-size: 14px;
          margin-bottom: 28px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
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
        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
        }
        .password-toggle:hover { color: var(--text); }
        .w-full { width: 100%; justify-content: center; }
        .auth-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
          color: var(--muted);
        }
        .auth-link {
          color: var(--reddit-orange);
          text-decoration: none;
          font-weight: 600;
        }
        .auth-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
