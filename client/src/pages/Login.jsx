import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  const handleGitHubLogin = () => {
    // GitHub OAuth logic
    window.location.href = "https://github.com/login/oauth/authorize?client_id=your_client_id";
  };

  const handleGitLabLogin = () => {
    // GitLab OAuth logic
    window.location.href = "https://gitlab.com/oauth/authorize?client_id=your_client_id";
  };

  return (
    <div className="auth-wrapper">
      {/* Background decoration */}
      <div className="auth-background">
        <div className="auth-chart-graphic">
          <svg viewBox="0 0 200 100" className="chart-svg">
            <rect x="10" y="70" width="15" height="30" fill="#8b5cf6" opacity="0.3" />
            <rect x="30" y="50" width="15" height="50" fill="#8b5cf6" opacity="0.5" />
            <rect x="50" y="30" width="15" height="70" fill="#8b5cf6" opacity="0.7" />
            <rect x="70" y="40" width="15" height="60" fill="#8b5cf6" opacity="0.6" />
            <rect x="90" y="20" width="15" height="80" fill="#8b5cf6" opacity="0.8" />
            <rect x="110" y="35" width="15" height="65" fill="#8b5cf6" opacity="0.5" />
            <rect x="130" y="45" width="15" height="55" fill="#8b5cf6" opacity="0.4" />
            <rect x="150" y="25" width="15" height="75" fill="#8b5cf6" opacity="0.6" />
            <rect x="170" y="55" width="15" height="45" fill="#8b5cf6" opacity="0.3" />
          </svg>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="20" cy="4" r="1" fill="currentColor" />
            </svg>
          </div>
          <h1 className="auth-title">Welcome back, developer</h1>
          <p className="auth-subtitle">Access your high-density engineering insights</p>
        </div>

        {/* OAuth Buttons */}
        <div className="oauth-buttons">
          <button 
            type="button" 
            className="oauth-btn github-btn" 
            onClick={handleGitHubLogin}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
          
          <button 
            type="button" 
            className="oauth-btn gitlab-btn" 
            onClick={handleGitLabLogin}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
            Continue with GitLab
          </button>
        </div>

        <div className="auth-divider">
          <span>OR SIGN IN WITH EMAIL</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">EMAIL ADDRESS</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              className="auth-input"
            />
          </div>

          <div className="form-group password-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="auth-input"
            />
            <button type="button" className="forgot-link">FORGOT?</button>
          </div>

          <button className="auth-submit-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Sign In to Pulse"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/signup">Create an account</Link>
        </p>

        {/* Status indicator */}
        <div className="auth-status">
          API V2.4 STATUS: <span className="status-optimal">OPTIMAL</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
