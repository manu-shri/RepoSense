import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  History,
  HelpCircle,
  LayoutDashboard,
  Activity,
  GitPullRequest,
  Users,
  Code,
  MessageSquare,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  GitMerge,
  Box,
  TrendingUp
} from "lucide-react";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(stored));
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="home-layout">
      {/* Top Navbar */}
      <header className="top-nav">
        <div className="nav-left">
          <div className="logo-container">
            <h1 className="logo-text">GitPulse AI</h1>
          </div>
          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input type="text" placeholder="Search repositories..." className="search-input" />
          </div>
        </div>
        <div className="nav-right">
          <button className="icon-btn"><Bell size={18} /></button>
          <button className="icon-btn"><History size={18} /></button>
          <button className="icon-btn"><HelpCircle size={18} /></button>
          <div className="user-avatar">
            <img src="https://github.com/octocat.png" alt="User" />
          </div>
        </div>
      </header>

      <div className="main-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="org-icon">
              <Box size={20} />
            </div>
            <div className="org-info">
              <h2>OCTOCORE SYSTEMS</h2>
              <p>V2.4 Analytics</p>
            </div>
          </div>
          <nav className="sidebar-nav">
            <a href="#" className="nav-item active">
              <LayoutDashboard size={18} /> Overview
            </a>
            <a href="#" className="nav-item">
              <ShieldCheck size={18} /> Repository Health
            </a>
            <a href="#" className="nav-item">
              <Activity size={18} /> Development Activity
            </a>
            <a href="#" className="nav-item">
              <Users size={18} /> Contributors
            </a>
            <a href="#" className="nav-item">
              <Code size={18} /> Tech Stack
            </a>
            <a href="#" className="nav-item">
              <MessageSquare size={18} /> Community Insights
            </a>
          </nav>
          <div className="sidebar-footer">
            <a href="#" className="nav-item">
              <Settings size={18} /> Settings
            </a>
          </div>
        </aside>

        {/* Content Area */}
        <main className="content-area">
          <div className="repo-header">
            <div className="repo-title-group">
              <div className="repo-name">
                <h1>octocore/core-engine</h1>
                <span className="badge active-badge">ACTIVE</span>
              </div>
              <div className="repo-meta">
                <span>Last commit: 2 hours ago • <span className="branch-name">main</span> branch</span>
              </div>
            </div>
            <div className="repo-stats-group">
              <div className="stat-block">
                <span className="stat-label">STARS</span>
                <span className="stat-value">4.2k</span>
              </div>
              <div className="stat-block">
                <span className="stat-label">FORKS</span>
                <span className="stat-value">850</span>
              </div>
              <div className="stat-block">
                <span className="stat-label">ISSUES</span>
                <span className="stat-value issue-val">42</span>
              </div>
              <button className="primary-btn">Analyze New PR</button>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Overall Health */}
            <div className="panel health-panel">
              <h3 className="panel-title">OVERALL HEALTH</h3>
              <div className="health-ring-container">
                <div className="health-ring">
                  <div className="health-grade">A+</div>
                </div>
              </div>
              <div className="health-desc">
                <h4>Exemplary Code Quality</h4>
                <p>Top 2% of analyzed repositories in the ecosystem.</p>
              </div>
            </div>

            {/* PR Lifecycle */}
            <div className="panel pr-panel">
              <div className="panel-header-flex">
                <h3 className="panel-title">PR LIFECYCLE</h3>
                <Activity size={16} className="panel-icon blue" />
              </div>
              <div className="pr-content">
                <div className="pr-donut">
                  <div className="donut-inner">65%</div>
                </div>
                <div className="pr-legend">
                  <div className="legend-item">
                    <span className="dot merged"></span> Merged: 214
                  </div>
                  <div className="legend-item">
                    <span className="dot open"></span> Open: 115
                  </div>
                </div>
              </div>
            </div>

            {/* Avg Merge Time */}
            <div className="panel merge-time-panel">
              <h3 className="panel-title">AVG MERGE TIME</h3>
              <div className="merge-content">
                <div className="merge-stats">
                  <div className="merge-val">1.4 <span>days</span></div>
                  <div className="merge-trend positive">
                    <TrendingUp size={14} /> 12% improvement
                  </div>
                </div>
                <div className="mini-chart">
                  <div className="bar b1"></div>
                  <div className="bar b2"></div>
                  <div className="bar b3"></div>
                  <div className="bar b4"></div>
                  <div className="bar b5"></div>
                </div>
              </div>
            </div>

            {/* Resolution Rate */}
            <div className="panel resolution-panel">
              <h3 className="panel-title">RESOLUTION RATE</h3>
              <div className="res-bars">
                <div className="res-item">
                  <div className="res-label">
                    <span>Bug Fixes</span>
                    <span>92%</span>
                  </div>
                  <div className="res-track"><div className="res-fill blue" style={{ width: '92%' }}></div></div>
                </div>
                <div className="res-item">
                  <div className="res-label">
                    <span>Features</span>
                    <span>84%</span>
                  </div>
                  <div className="res-track"><div className="res-fill purple" style={{ width: '84%' }}></div></div>
                </div>
              </div>
            </div>

            {/* Stale Issues */}
            <div className="panel stale-issues-panel">
              <div className="panel-header-flex">
                <h3 className="panel-title">STALE ISSUES</h3>
                <span className="stale-count">12</span>
              </div>
              <div className="issues-list">
                <div className="issue-item">
                  <span className="issue-name">#1204 auth-bug-fix</span>
                  <span className="issue-time">42 days</span>
                </div>
                <div className="issue-item">
                  <span className="issue-name">#1198 docs-update</span>
                  <span className="issue-time">38 days</span>
                </div>
                <div className="issue-item">
                  <span className="issue-name">#1182 ci-optimization</span>
                  <span className="issue-time">31 days</span>
                </div>
              </div>
            </div>

            {/* Security Health */}
            <div className="panel security-panel">
              <div className="panel-header-flex">
                <h3 className="panel-title">SECURITY HEALTH</h3>
                <ShieldCheck size={16} className="panel-icon green" />
              </div>
              <div className="sec-score">94<span>/100</span></div>
              <p className="sec-desc">0 Vulnerabilities detected in 184 dependencies.</p>
              <div className="sec-tags">
                <span className="tag green-tag">Snyk Passed</span>
                <span className="tag green-tag">Dependabot Active</span>
              </div>
            </div>

            {/* Commit Velocity */}
            <div className="panel velocity-panel">
              <div className="panel-header-flex">
                <h3 className="panel-title">COMMIT VELOCITY (30D)</h3>
                <div className="velocity-legend">
                  <span className="v-leg"><span className="dot blue"></span> Main</span>
                  <span className="v-leg"><span className="dot dark"></span> Dev</span>
                </div>
              </div>
              <div className="velocity-chart-mock">
                {/* Mocked bar chart visually matching the image */}
                <div className="v-group"><div className="v-bar dark" style={{height:'30%'}}></div></div>
                <div className="v-group"><div className="v-bar blue" style={{height:'40%'}}></div></div>
                <div className="v-group"><div className="v-bar dark" style={{height:'25%'}}></div></div>
                <div className="v-group"><div className="v-bar blue" style={{height:'50%'}}></div></div>
                <div className="v-group"><div className="v-bar blue" style={{height:'45%'}}></div></div>
                <div className="v-group"><div className="v-bar blue" style={{height:'65%'}}></div></div>
                <div className="v-gap"></div>
                <div className="v-group"><div className="v-bar dark" style={{height:'25%'}}></div></div>
                <div className="v-group"><div className="v-bar dark" style={{height:'25%'}}></div></div>
                <div className="v-group"><div className="v-bar blue" style={{height:'35%'}}></div></div>
                <div className="v-gap"></div>
                <div className="v-group"><div className="v-bar blue" style={{height:'80%'}}></div></div>
                <div className="v-group"><div className="v-bar dark" style={{height:'45%'}}></div></div>
                <div className="v-group"><div className="v-bar dark" style={{height:'30%'}}></div></div>
                <div className="v-group"><div className="v-bar dark" style={{height:'35%'}}></div></div>
              </div>
            </div>

            {/* Top Contributors */}
            <div className="panel contributors-panel">
              <h3 className="panel-title">TOP CONTRIBUTORS</h3>
              <div className="contrib-list">
                <div className="contrib-item">
                  <div className="c-user">
                    <img src="https://github.com/octocat.png" alt="octocat" className="c-avatar" />
                    <span>octocat</span>
                  </div>
                  <span className="c-commits blue-text">482 commits</span>
                </div>
                <div className="contrib-item">
                  <div className="c-user">
                    <img src="https://github.com/defunkt.png" alt="v-dev-01" className="c-avatar" />
                    <span>v-dev-01</span>
                  </div>
                  <span className="c-commits blue-text">321 commits</span>
                </div>
                <div className="contrib-item">
                  <div className="c-user">
                    <img src="https://github.com/torvalds.png" alt="stack_king" className="c-avatar" />
                    <span>stack_king</span>
                  </div>
                  <span className="c-commits blue-text">215 commits</span>
                </div>
              </div>
            </div>

            {/* Peak Coding Hours */}
            <div className="panel hours-panel">
              <h3 className="panel-title">PEAK CODING HOURS</h3>
              <div className="hours-grid">
                <div className="h-block faint"></div>
                <div className="h-block faint"></div>
                <div className="h-block light"></div>
                <div className="h-block active"></div>
                <div className="h-block active"></div>
                <div className="h-block active"></div>
              </div>
              <div className="hours-labels">
                <span>00:00</span>
                <span>08:00</span>
                <span>16:00</span>
                <span className="blue-text">20:00 - 23:00</span>
              </div>
              <p className="hours-desc">Team is most active in evening blocks (PST).</p>
            </div>

            {/* Tech Stack */}
            <div className="panel stack-panel">
              <h3 className="panel-title">TECH STACK</h3>
              <div className="stack-tags">
                <div className="stack-tag"><span className="dot blue"></span> React</div>
                <div className="stack-tag"><span className="dot gray"></span> Node.js</div>
                <div className="stack-tag"><span className="dot blue"></span> TypeScript</div>
                <div className="stack-tag"><span className="dot green"></span> MongoDB</div>
              </div>
            </div>

            {/* Deployment Pipeline */}
            <div className="panel pipeline-panel">
              <h3 className="panel-title">DEPLOYMENT PIPELINE</h3>
              <div className="pipe-list">
                <div className="pipe-item">
                  <div className="p-left">
                    <CheckCircle2 size={16} className="green" />
                    <span>GitHub Actions</span>
                  </div>
                  <span className="p-right green-text">99% Success</span>
                </div>
                <div className="pipe-item">
                  <div className="p-left">
                    <Activity size={16} className="green" />
                    <span>Vercel Edge</span>
                  </div>
                  <span className="p-right dark-text">Healthy</span>
                </div>
              </div>
            </div>

            {/* Latest Release */}
            <div className="panel release-panel">
              <h3 className="panel-title">LATEST RELEASE</h3>
              <div className="release-info">
                <div className="r-version">
                  <span className="dot blue"></span>
                  <h4>v2.4.0</h4>
                  <span className="r-tag">Current</span>
                </div>
                <p className="r-desc">3 days ago • 14 feature updates, 2 hotfixes.</p>
                <a href="#" className="r-link">View full changelog</a>
              </div>
            </div>

            {/* Documentation Score */}
            <div className="panel docs-panel">
              <div className="panel-header-flex">
                <h3 className="panel-title">DOCUMENTATION SCORE</h3>
              </div>
              <div className="docs-content">
                <div className="docs-score">92<span>/100</span></div>
                <div className="docs-bar-container">
                  <div className="docs-bar-label">COVERAGE</div>
                  <div className="docs-bar-track">
                    <div className="docs-bar-fill" style={{width:'92%'}}></div>
                  </div>
                </div>
                <div className="docs-checks">
                  <span><CheckCircle2 size={12} className="green" /> Setup</span>
                  <span><CheckCircle2 size={12} className="green" /> API Docs</span>
                  <span><CheckCircle2 size={12} className="green" /> Usage</span>
                </div>
              </div>
            </div>

            {/* Community Standards */}
            <div className="panel standards-panel">
              <h3 className="panel-title">COMMUNITY STANDARDS</h3>
              <div className="std-grid">
                <div className="std-item"><CheckCircle2 size={14} className="green" /> Readme</div>
                <div className="std-item"><CheckCircle2 size={14} className="green" /> License</div>
                <div className="std-item"><AlertCircle size={14} className="gray" /> Security</div>
                <div className="std-item"><CheckCircle2 size={14} className="green" /> Contributing</div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
