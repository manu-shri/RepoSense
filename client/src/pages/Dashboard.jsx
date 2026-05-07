import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BarChart3,
  ExternalLink,
  GitCommit,
  HardDriveDownload,
  LogOut,
  Sparkles,
} from "lucide-react";
import { getGithubDashboard } from "../services/api.js";
import "./Dashboard.css";

const nf = new Intl.NumberFormat(undefined, { notation: "compact" });

const langColors = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gh, setGh] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(stored));
  }, [navigate]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getGithubDashboard("public-apis", "public-apis");
        if (!alive) return;
        setGh(data);
      } catch (err) {
        if (!alive) return;
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to load GitHub dashboard";
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  const repo = gh?.repo;
  const commitActivityRaw = Array.isArray(gh?.commit_activity) ? gh.commit_activity : [];
  const activity = commitActivityRaw.slice(-12).map((w) => {
    const date = new Date((w.week || 0) * 1000);
    const label = date.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
    const total = w.total || 0;
    const avg = Math.round(total / 7);
    return { week: label, commits: total, avgPerDay: avg };
  });

  const contributorsRaw = Array.isArray(gh?.contributors) ? gh.contributors : [];
  const repoVelocity = contributorsRaw
    .slice(0, 8)
    .map((c) => ({ name: c.login, contributions: c.contributions || 0 }));

  const langObj = gh?.languages && typeof gh.languages === "object" ? gh.languages : {};
  const langEntries = Object.entries(langObj);
  const langTotal = langEntries.reduce((s, [, v]) => s + (typeof v === "number" ? v : 0), 0) || 1;
  const languages = langEntries
    .sort((a, b) => (b[1] || 0) - (a[1] || 0))
    .slice(0, 5)
    .map(([name, bytes]) => ({
      name,
      value: Math.round(((bytes || 0) / langTotal) * 100),
      color: langColors[name] || "#8b949e",
    }));
  const otherPct =
    100 - languages.reduce((s, l) => s + l.value, 0);
  if (otherPct > 0) {
    languages.push({ name: "Other", value: otherPct, color: "#8b949e" });
  }

  const kpis = [
    {
      label: "Stars",
      value: repo ? nf.format(repo.stargazers_count || 0) : "—",
      delta: repo?.updated_at ? `Updated ${new Date(repo.updated_at).toLocaleDateString()}` : "",
      icon: <Sparkles size={18} />,
      tone: "good",
    },
    {
      label: "Forks",
      value: repo ? nf.format(repo.forks_count || 0) : "—",
      delta: repo?.default_branch ? `Branch: ${repo.default_branch}` : "",
      icon: <GitCommit size={18} />,
      tone: "neutral",
    },
    {
      label: "Open issues",
      value: repo ? nf.format(repo.open_issues_count || 0) : "—",
      delta: repo?.pushed_at ? `Pushed ${new Date(repo.pushed_at).toLocaleDateString()}` : "",
      icon: <Activity size={18} />,
      tone: "neutral",
    },
    {
      label: "Top contributors",
      value: contributorsRaw.length ? `${contributorsRaw.length}+` : "—",
      delta: gh?.rate_limit_note || "",
      icon: <HardDriveDownload size={18} />,
      tone: "neutral",
    },
  ];

  return (
    <div className="dash-bg">
      <header className="dash-topbar">
        <div className="dash-brand">
          <div className="dash-mark" aria-hidden="true">
            RS
          </div>
          <div className="dash-brandText">
            <div className="dash-brandTitle">
              RepoSense <span style={{ opacity: 0.5, fontWeight: 700 }}>•</span>{" "}
              <span style={{ fontWeight: 800 }}>{repo?.full_name || "public-apis/public-apis"}</span>
            </div>
            <div className="dash-brandSub">
              {repo?.description || "Public APIs — a collective list of free APIs"}
            </div>
          </div>
        </div>

        <div className="dash-user">
          {repo?.html_url && (
            <a className="dash-logout" href={repo.html_url} target="_blank" rel="noreferrer">
              <ExternalLink size={16} />
              View repo
            </a>
          )}
          <div className="dash-userMeta">
            <div className="dash-userName">{user.username}</div>
            <div className="dash-userEmail">{user.email}</div>
          </div>
          <button className="dash-logout" onClick={handleLogout} type="button">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>

      <main className="dash-shell">
        {(loading || error) && (
          <section className="dash-kpis" style={{ marginBottom: "1rem" }}>
            <div className="kpi">
              <div className="kpi-row">
                <div className="kpi-label">GitHub data</div>
                <div className="kpi-icon">
                  <BarChart3 size={18} />
                </div>
              </div>
              <div className="kpi-value">{loading ? "Loading…" : "Unavailable"}</div>
              <div className="kpi-delta">
                {error
                  ? error
                  : "Fetching live repo metrics from GitHub API"}
              </div>
            </div>
          </section>
        )}

        <section className="dash-kpis">
          {kpis.map((k) => (
            <div key={k.label} className={`kpi kpi--${k.tone}`}>
              <div className="kpi-row">
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-icon">{k.icon}</div>
              </div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-delta">{k.delta}</div>
            </div>
          ))}
        </section>

        <section className="dash-grid">
          <div className="panel panel--wide">
            <div className="panel-head">
              <div>
                <div className="panel-title">Commit activity trend</div>
                <div className="panel-sub">Weekly commits (last 12 weeks)</div>
              </div>
              <div className="panel-pill">GitHub stats</div>
            </div>

            <div className="panel-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activity} margin={{ top: 10, right: 18, left: -6, bottom: 0 }}>
                  <defs>
                    <linearGradient id="commitsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2ea043" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2ea043" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(240,246,252,0.08)" vertical={false} />
                  <XAxis dataKey="week" stroke="rgba(240,246,252,0.6)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(240,246,252,0.5)" tickLine={false} axisLine={false} width={32} />
                  <Tooltip
                    contentStyle={{
                      background: "#0d1117",
                      border: "1px solid #30363d",
                      borderRadius: 10,
                      color: "#e6edf3",
                    }}
                    labelStyle={{ color: "#8b949e" }}
                  />
                  <Area type="monotone" dataKey="commits" stroke="#2ea043" fill="url(#commitsFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Top contributors</div>
                <div className="panel-sub">Total contributions (top 8)</div>
              </div>
              <div className="panel-pill">Top 5</div>
            </div>
            <div className="panel-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={repoVelocity} margin={{ top: 10, right: 18, left: -6, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(240,246,252,0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(240,246,252,0.6)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(240,246,252,0.5)" tickLine={false} axisLine={false} width={32} />
                  <Tooltip
                    contentStyle={{
                      background: "#0d1117",
                      border: "1px solid #30363d",
                      borderRadius: 10,
                      color: "#e6edf3",
                    }}
                    labelStyle={{ color: "#8b949e" }}
                  />
                  <Bar dataKey="contributions" fill="#388bfd" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Languages</div>
                <div className="panel-sub">Codebase composition</div>
              </div>
              <div className="panel-pill">Share</div>
            </div>

            <div className="panel-chart panel-chart--pie">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      background: "#0d1117",
                      border: "1px solid #30363d",
                      borderRadius: 10,
                      color: "#e6edf3",
                    }}
                    labelStyle={{ color: "#8b949e" }}
                  />
                  <Pie
                    data={languages}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={84}
                    paddingAngle={2}
                    stroke="rgba(240,246,252,0.08)"
                  >
                    {languages.map((l) => (
                      <Cell key={l.name} fill={l.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="legend">
                {languages.map((l) => (
                  <div className="legend-row" key={l.name}>
                    <span className="legend-dot" style={{ background: l.color }} />
                    <span className="legend-name">{l.name}</span>
                    <span className="legend-val">{l.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
