import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Github } from "lucide-react";
import { login } from "../services/api.js";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "dev@gitpulse.ai", password: "dev123456" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h1 className="auth-title">Welcome back, developer</h1>
          <p className="auth-subtitle">Access your high-density engineering insights</p>
        </div>

        <div className="oauth-buttons">
          <button className="oauth-btn github-btn">
            <Github size={18} /> Continue with GitHub
          </button>
          <button className="oauth-btn gitlab-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M22.65 14.39L12 22.13L1.35 14.39L2.6 4.03L12 1L21.4 4.03L22.65 14.39Z" fill="#E24329" />
            </svg>
            Continue with GitLab
          </button>
        </div>

        <div className="auth-divider">
          <span>OR SIGN IN WITH EMAIL</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">EMAIL ADDRESS</label>
            <div className="input-container">
              <Mail className="input-icon" size={16} />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="auth-input"
                placeholder="dev@gitpulse.ai"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <button type="button" className="forgot-link">FORGOT?</button>
            <div className="input-container">
              <Lock className="input-icon" size={16} />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className="auth-input"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button className="auth-submit-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In to Pulse"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Create an account</Link>
        </p>

        <div className="status-badge">
          <span className="status-dot"></span>
          API V2.4 STATUS: OPTIMAL
        </div>
      </div>
    </div>
  );
};

export default Login;
