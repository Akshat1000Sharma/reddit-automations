"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";
import { Eye, EyeOff, Zap, Check } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const passwordStrength = () => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) return toast.error("Please fill all fields");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    setLoading(true);
    try {
      await register(email, password, confirmPassword);
      toast.success("Account created! Welcome to RedditBot");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Registration failed";
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
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start automating Reddit today</p>

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
                placeholder="Min. 8 characters"
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
            {password.length > 0 && (
              <div className="strength-wrapper">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="strength-bar"
                      style={{ background: strength >= i ? strengthColors[strength] : "var(--border)" }}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthColors[strength] }}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                className="input-dark"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingRight: "44px" }}
              />
              {confirmPassword && (
                <div className="password-toggle" style={{ color: confirmPassword === password ? "#22c55e" : "#ef4444" }}>
                  {confirmPassword === password ? <Check size={16} /> : <span style={{ fontSize: 16 }}>✕</span>}
                </div>
              )}
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link href="/auth/login" className="auth-link">Sign in</Link>
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
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,69,0,0.06) 0%, transparent 70%);
          bottom: -100px;
          left: -100px;
          pointer-events: none;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
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
        .strength-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
        }
        .strength-bars {
          display: flex;
          gap: 4px;
          flex: 1;
        }
        .strength-bar {
          height: 3px;
          border-radius: 2px;
          flex: 1;
          transition: background 0.3s;
        }
        .strength-label {
          font-size: 11px;
          font-weight: 600;
          min-width: 40px;
          text-align: right;
        }
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
