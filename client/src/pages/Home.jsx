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
  TrendingUp,
  Link2,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  User,
  LogOut
} from "lucide-react";
import { getGithubDashboard } from "../services/api.js";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dashboard Data State (Defaults to placeholders until analyzed)
  const [data, setData] = useState({
    repo: {
      full_name: "octocore/core-engine",
      stargazers_count: 4200,
      forks_count: 850,
      open_issues_count: 42,
      updated_at: new Date().toISOString(),
      default_branch: "main"
    },
    languages: { "React": 65, "TypeScript": 20, "Node.js": 10, "MongoDB": 5 },
    commit_activity: [], // Will be filled on analyze
    contributors: []
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(stored));
  }, [navigate]);

  const parseRepoUrl = (url) => {
    try {
      // Remove protocol and split by slash
      const cleanUrl = url.replace(/^(http|https):\/\//, "").replace(/\/$/, "");
      const segments = cleanUrl.split("/");

      // Typical GitHub URL: github.com/owner/repo/...
      // segments[0] = domain, segments[1] = owner, segments[2] = repo
      if (segments.length >= 3) {
        const owner = segments[1];
        const repo = segments[2].replace(/\.git$/, ""); // Strip .git
        if (owner && repo) return { owner, repo };
      }

      // Fallback for simple "owner/repo" input
      if (segments.length === 2) {
        let [owner, repo] = segments;
        repo = repo.replace(/\.git$/, ""); // Strip .git
        if (owner && repo) return { owner, repo };
      }

      return null;
    } catch (e) {
      return null;
    }
  };

  const handleAnalyze = async () => {
    if (!repoUrl) {
      setError("Please enter a repository URL");
      return;
    }

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      setError("Invalid repository URL format");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Instead of waiting here, we navigate to the dashboard page which will handle the loading state
      navigate(`/dashboard/${parsed.owner}/${parsed.repo}`);
    } catch (err) {
      setError("Could not parse repository details.");
      setLoading(false);
    }
    setLoading(false)
  };

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#06080c] text-[#e6edf3] font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#d1d9e1] flex-col hidden lg:flex border-r border-white/5 shrink-0 relative z-20">
        <div className="p-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#8957e5]/10 rounded-lg flex items-center justify-center text-[#8957e5] border border-[#8957e5]/20 shadow-sm">
            <Box size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-[10px] font-black text-[#1f2328] uppercase tracking-tighter leading-tight">OCTOCORE SYSTEMS</h2>
            <p className="text-[9px] font-bold text-[#57606a]">V2.4 Analytics</p>
          </div>
        </div>

        <nav className="flex-1 px-3 flex flex-col gap-1 mt-6">
          <NavItem icon={<LayoutDashboard size={17} />} label="Overview" active />
          <NavItem icon={<ShieldCheck size={17} />} label="Repository Health" />
          <NavItem icon={<Activity size={17} />} label="Development Activity" />
          <NavItem icon={<Users size={17} />} label="Contributors" />
          <NavItem icon={<Code size={17} />} label="Tech Stack" />
          <NavItem icon={<MessageSquare size={17} />} label="Community Insights" />
        </nav>

        <div className="p-4 mb-2">
          <NavItem icon={<Settings size={17} />} label="Settings" />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[56px] border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#06080c] z-50">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold tracking-tight text-white">GitPulse AI</h1>
            <div className="relative group w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]" size={14} />
              <input
                type="text"
                placeholder="Search repositories..."
                className="w-full bg-[#111827]/50 border border-[#1f2937] rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-[#8957e5]/50 transition-all placeholder:text-[#484f58] text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-5 relative">
            <div className="flex items-center gap-4 text-[#8b949e]">
              <button className="hover:text-white transition-colors"><Bell size={18} /></button>
              <button className="hover:text-white transition-colors"><History size={18} /></button>
              <button className="hover:text-white transition-colors"><HelpCircle size={18} /></button>
            </div>

            {/* PROFILE MENU TRIGGER */}
            <div
              className="w-8 h-8 rounded-full overflow-hidden border border-white/10 cursor-pointer hover:border-[#8957e5]/50 transition-all relative"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100" alt="Avatar" className="w-full h-full object-cover" />
            </div>

            {/* DROPDOWN MENU */}
            {showProfileMenu && (
              <div className="absolute top-10 right-0 w-56 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl z-[100] py-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5">Signed in as</p>
                  <p className="text-sm font-bold text-white truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                    <User size={16} /> Your Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                    <Settings size={16} /> Settings
                  </button>
                </div>
                <div className="pt-1 border-t border-white/5">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-2 font-bold"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 custom-scrollbar">
          {/* REPO HERO SECTION - Dynamically Updated */}
          <div className="bg-[#0f172a]/30 border border-[#1f2937] rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <h2 className="text-2xl font-black tracking-tight text-white">{data.repo.full_name}</h2>
                <span className="bg-[#8957e5]/10 text-[#bc8cff] px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-[#8957e5]/20">ACTIVE</span>
              </div>
              <p className="text-[12px] text-[#64748b]">
                Updated: {new Date(data.repo.updated_at).toLocaleDateString()} • <span className="text-[#388bfd] font-bold">{data.repo.default_branch || "main"}</span> branch
              </p>
            </div>

            <div className="flex items-center gap-10">
              <div className="flex gap-8">
                <StatItem label="STARS" value={Intl.NumberFormat('en', { notation: 'compact' }).format(data.repo.stargazers_count)} />
                <StatItem label="FORKS" value={Intl.NumberFormat('en', { notation: 'compact' }).format(data.repo.forks_count)} />
                <StatItem label="ISSUES" value={data.repo.open_issues_count} color="text-[#ff7b72]" />
              </div>
              <button
                onClick={() => setRepoUrl(`https://github.com/${data.repo.full_name}`)}
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-5 py-2 rounded-lg font-bold text-xs transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                Analyze New PR
              </button>
            </div>
          </div>

          {/* ANALYZE REPOSITORY SEARCH SECTION - Now Functional */}
          <section className="bg-[#0f172a]/30 border border-[#1f2937] rounded-xl p-6 border-l-4 border-l-[#8957e5] shadow-md relative">
            {loading && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl">
                <Loader2 className="text-[#8957e5] animate-spin" size={32} />
              </div>
            )}

            <div className="flex items-center gap-2.5 mb-2">
              <div className="text-[#8957e5] bg-[#8957e5]/10 p-1.5 rounded-lg"><Activity size={16} /></div>
              <h3 className="text-sm font-bold text-white tracking-tight">Analyze Repository</h3>
            </div>
            <p className="text-[12px] text-[#64748b] mb-5 max-w-[600px] leading-relaxed">Enter a GitHub or GitLab repository URL to perform a deep pulse analysis of code quality, commit velocity, and contributor health.</p>

            {error && <p className="text-[10px] text-red-400 font-bold mb-3 uppercase tracking-wider">{error}</p>}

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#484f58]" size={16} />
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => {
                    setRepoUrl(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="https://github.com/user/repo"
                  className="w-full bg-[#020617] border border-[#1f2937] rounded-lg py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#8957e5]/50 transition-all placeholder:text-[#334155] text-white"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />} Analyze
              </button>
            </div>
          </section>

          {/* KPI GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#0f172a]/30 border border-[#1f2937] rounded-xl p-6 flex flex-col items-center text-center row-span-2 shadow-sm">
              <h4 className="text-[9px] font-black text-[#64748b] uppercase tracking-[0.2em] self-start mb-6">OVERALL HEALTH</h4>
              <div className="flex-1 flex items-center justify-center mb-6">
                <div className="w-[160px] h-[160px] rounded-full bg-[conic-gradient(#4f46e5_0%_100%)] flex items-center justify-center p-3 shadow-[0_0_50px_rgba(79,70,229,0.1)]">
                  <div className="w-full h-full bg-[#06080c] rounded-full flex items-center justify-center border border-white/5">
                    <span className="text-[4.5rem] font-black text-[#4f46e5] drop-shadow-[0_0_20px_rgba(79,70,229,0.3)]">A+</span>
                  </div>
                </div>
              </div>
              <p className="text-[12px] text-[#64748b] mb-1 font-medium italic">Exemplary Code Quality</p>
              <p className="text-[10px] text-[#334155] font-bold">Top 2% of analyzed repositories in the ecosystem.</p>
            </div>

            <Panel title="PR LIFECYCLE" icon={<RefreshCw size={12} className={`text-indigo-400 opacity-60 ${loading ? 'animate-spin' : ''}`} />}>
              <div className="flex items-center gap-6 py-1">
                <div className="w-24 h-24 rounded-full bg-[conic-gradient(#8957e5_0%_65%,#1f2937_65%_100%)] flex items-center justify-center relative">
                  <div className="w-16 h-16 bg-[#06080c] rounded-full flex items-center justify-center font-bold text-lg text-white">65%</div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 text-[11px] font-bold text-[#64748b]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8957e5] shadow-[0_0_5px_rgba(137,87,229,0.4)]"></span> Merged: 214
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] font-bold text-[#64748b]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1f2937]"></span> Open: 115
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="AVG MERGE TIME">
              <div className="flex justify-between items-center py-1">
                <div>
                  <div className="text-4xl font-black mb-1 tracking-tighter text-white">1.4 <span className="text-xs font-bold text-[#484f58] tracking-normal uppercase">days</span></div>
                  <div className="text-[#10b981] text-[9px] font-black tracking-widest flex items-center gap-1 uppercase">
                    <TrendingUp size={12} strokeWidth={3} /> 12% improvement
                  </div>
                </div>
                <div className="flex items-end gap-1.5 h-12">
                  {[0.6, 0.4, 0.7, 0.85, 1].map((h, i) => (
                    <div key={i} className={`w-2 rounded-sm ${i === 4 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-indigo-500/20'}`} style={{ height: `${h * 100}%` }} />
                  ))}
                </div>
              </div>
            </Panel>

            <Panel title="RESOLUTION RATE">
              <div className="space-y-5 py-1">
                <div>
                  <div className="flex justify-between text-[10px] font-black mb-1.5 uppercase text-[#64748b]">
                    <span>Bug Fixes</span>
                    <span className="text-white font-black">92%</span>
                  </div>
                  <div className="h-1 bg-[#1f2937] rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.3)]" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black mb-1.5 uppercase text-[#64748b]">
                    <span>Features</span>
                    <span className="text-white font-black">84%</span>
                  </div>
                  <div className="h-1 bg-[#1f2937] rounded-full overflow-hidden">
                    <div className="h-full bg-[#bc8cff] rounded-full shadow-[0_0_8px_rgba(188,140,255,0.3)]" style={{ width: '84%' }}></div>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="STALE ISSUES" extra={<span className="text-lg font-black text-[#10b981]">12</span>}>
              <div className="space-y-3 py-1">
                <IssueItem id="#1204" title="auth-bug-fix" time="42 days" />
                <IssueItem id="#1198" title="docs-update" time="38 days" />
                <IssueItem id="#1182" title="ci-optimization" time="31 days" />
              </div>
            </Panel>

            <Panel title="SECURITY HEALTH" icon={<div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20"><ShieldCheck size={10} /></div>}>
              <div className="py-1">
                <div className="text-4xl font-black mb-2 tracking-tighter text-white">94<span className="text-xs font-bold text-[#484f58] tracking-normal">/100</span></div>
                <p className="text-[10px] text-[#64748b] mb-4 font-medium">0 Vulnerabilities detected in 184 dependencies.</p>
                <div className="flex gap-2">
                  <span className="text-[8px] font-black px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest shadow-sm">Snyk Passed</span>
                  <span className="text-[8px] font-black px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest shadow-sm">Dependabot Active</span>
                </div>
              </div>
            </Panel>

            <div className="bg-[#0f172a]/30 border border-[#1f2937] rounded-xl p-6 flex flex-col md:col-span-2 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-[9px] font-black text-[#64748b] uppercase tracking-[0.2em]">COMMIT VELOCITY (30D)</h4>
                <div className="flex gap-5">
                  <span className="flex items-center gap-2 text-[9px] font-black text-[#64748b] uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.5)]"></span> Main</span>
                  <span className="flex items-center gap-2 text-[9px] font-black text-[#64748b] uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-[#1f2937]"></span> Dev</span>
                </div>
              </div>
              <div className="flex items-end gap-2 h-[120px] mt-auto">
                {data.commit_activity?.length > 0 ? (
                  data.commit_activity.slice(-14).map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group/bar">
                      <div className={`w-full rounded-sm transition-all duration-500 ${i % 2 === 0 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.1)] hover:bg-indigo-400' : 'bg-[#1f2937]'}`} style={{ height: `${Math.min(h.total * 2, 100)}%` }} />
                    </div>
                  ))
                ) : (
                  [30, 45, 25, 60, 55, 75, 40, 35, 45, 85, 50, 40, 55, 90].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group/bar">
                      <div className={`w-full rounded-sm transition-all duration-500 ${i % 2 === 0 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.1)] hover:bg-indigo-400' : 'bg-[#1f2937]'}`} style={{ height: `${h}%` }} />
                    </div>
                  ))
                )}
              </div>
            </div>

            <Panel title="TOP CONTRIBUTORS">
              <div className="space-y-4 py-1">
                {data.contributors?.length > 0 ? (
                  data.contributors.slice(0, 3).map((c, i) => (
                    <Contributor key={i} name={c.login} avatar={c.avatar_url} commits={c.contributions} />
                  ))
                ) : (
                  <>
                    <Contributor name="octocat" avatar="https://github.com/octocat.png" commits="482" />
                    <Contributor name="v-dev-01" avatar="https://github.com/defunkt.png" commits="321" />
                    <Contributor name="stack_king" avatar="https://github.com/torvalds.png" commits="215" />
                  </>
                )}
              </div>
            </Panel>

            <Panel title="PEAK CODING HOURS">
              <div className="py-1">
                <div className="flex gap-1.5 h-8 mb-3">
                  {[0.2, 0.2, 0.3, 0.5, 0.7, 1].map((o, i) => (
                    <div key={i} className="flex-1 bg-indigo-500 rounded-sm" style={{ opacity: o }} />
                  ))}
                </div>
                <div className="flex justify-between text-[8px] font-black text-[#334155] uppercase mb-4 tracking-tight">
                  <span>00:00</span>
                  <span>08:00</span>
                  <span>16:00</span>
                  <span className="text-indigo-400 font-black">20:00 - 23:00</span>
                </div>
                <p className="text-[10px] text-[#64748b] italic font-medium">Team is most active in evening blocks (PST).</p>
              </div>
            </Panel>

            <Panel title="TECH STACK">
              <div className="flex flex-wrap gap-2.5 py-1">
                {Object.entries(data.languages || {}).slice(0, 4).map(([name, pct], i) => (
                  <StackTag key={i} name={name} color={i === 0 ? "#388bfd" : i === 1 ? "#3178c6" : "#2ea043"} />
                ))}
                {Object.keys(data.languages || {}).length === 0 && (
                  <>
                    <StackTag name="React" color="#388bfd" />
                    <StackTag name="Node.js" color="#8b949e" />
                    <StackTag name="TypeScript" color="#3178c6" />
                    <StackTag name="MongoDB" color="#2ea043" />
                  </>
                )}
              </div>
            </Panel>

            <Panel title="DEPLOYMENT PIPELINE">
              <div className="space-y-4 py-1">
                <PipelineItem name="GitHub Actions" status="99% Success" icon={<CheckCircle2 size={14} className="text-[#10b981]" />} />
                <PipelineItem name="Vercel Edge" status="Healthy" icon={<Activity size={14} className="text-[#10b981]" />} />
              </div>
            </Panel>

            <Panel title="LATEST RELEASE">
              <div className="py-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_5px_rgba(99,102,241,0.5)]" />
                  <h5 className="font-black text-lg text-white tracking-tight">v2.4.0</h5>
                  <span className="text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 tracking-widest uppercase">Current</span>
                </div>
                <p className="text-[10px] text-[#64748b] mb-4 leading-relaxed font-medium">3 days ago • 14 feature updates, 2 hotfixes.</p>
                <a href="#" className="text-[9px] font-black text-indigo-400 uppercase flex items-center gap-1 hover:underline group">
                  View full changelog <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </Panel>

            <Panel title="DOCUMENTATION SCORE">
              <div className="py-1">
                <div className="text-3xl font-black mb-2 tracking-tighter text-white">92<span className="text-xs font-bold text-[#484f58] tracking-normal">/100</span></div>
                <div className="h-1 bg-[#1f2937] rounded-full overflow-hidden mb-5 shadow-inner">
                  <div className="h-full bg-[#8957e5] shadow-[0_0_10px_rgba(137,87,229,0.3)]" style={{ width: '92%' }}></div>
                </div>
                <div className="flex gap-4 text-[9px] font-black text-[#64748b] uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#10b981]" /> Setup</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#10b981]" /> API Docs</span>
                </div>
              </div>
            </Panel>

            <Panel title="COMMUNITY STANDARDS">
              <div className="grid grid-cols-2 gap-y-3.5 py-1">
                <StandardItem label="Readme" active />
                <StandardItem label="License" active />
                <StandardItem label="Security" />
                <StandardItem label="Contributing" active />
              </div>
            </Panel>
          </div>
        </main>
      </div>
    </div>
  );
};

// HELPER COMPONENTS
const NavItem = ({ icon, label, active = false }) => (
  <a href="#" className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-[12px] font-black tracking-tight transition-all ${active
    ? 'bg-[#dee5ed] text-[#1f2328] shadow-sm'
    : 'text-[#57606a] hover:bg-[#c1ccd6] hover:text-[#1f2328]'
    }`}>
    <span className={active ? 'text-[#8957e5]' : 'text-[#57606a]'}>{icon}</span> {label}
  </a>
);

const StatItem = ({ label, value, color = "text-white" }) => (
  <div className="flex flex-col items-center">
    <span className="text-[9px] font-black text-[#484f58] tracking-widest mb-1 uppercase leading-none">{label}</span>
    <span className={`text-xl font-black tracking-tight ${color}`}>{value}</span>
  </div>
);

const Panel = ({ title, icon, children, extra }) => (
  <div className="bg-[#0f172a]/30 border border-[#1f2937] rounded-xl p-5 flex flex-col shadow-sm">
    <div className="flex justify-between items-center mb-5">
      <h4 className="text-[9px] font-black text-[#64748b] uppercase tracking-[0.2em]">{title}</h4>
      <div className="flex items-center gap-2">
        {extra}
        {icon}
      </div>
    </div>
    <div className="flex-1">
      {children}
    </div>
  </div>
);

const IssueItem = ({ id, title, time }) => (
  <div className="flex justify-between items-center text-[11px] group cursor-default">
    <span className="text-[#64748b] font-mono">{id} <span className="text-[#e6edf3] font-sans font-bold ml-1 group-hover:text-indigo-400 transition-colors">{title}</span></span>
    <span className="text-[#334155] font-black uppercase text-[9px] tracking-tighter">{time}</span>
  </div>
);

const Contributor = ({ name, avatar, commits }) => (
  <div className="flex justify-between items-center group">
    <div className="flex items-center gap-3">
      <img src={avatar} alt={name} className="w-6 h-6 rounded border border-[#1f2937] group-hover:border-indigo-500/50 transition-all shadow-sm" />
      <span className="text-[13px] font-bold text-[#e6edf3] group-hover:text-white transition-colors">{name}</span>
    </div>
    <span className="text-[11px] font-black text-indigo-400">{commits} <span className="text-[8px] text-[#484f58] uppercase">commits</span></span>
  </div>
);

const StackTag = ({ name, color }) => (
  <div className="flex items-center gap-2 bg-[#f6f8fa] border border-[#d0d7de] px-3 py-1 rounded-md shadow-sm hover:border-[#8957e5]/50 transition-all cursor-default group">
    <span className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ backgroundColor: color }}></span>
    <span className="text-[10px] font-black uppercase tracking-tight text-[#1f2328]">{name}</span>
  </div>
);

const PipelineItem = ({ name, status, icon }) => (
  <div className="flex justify-between items-center text-[11px]">
    <div className="flex items-center gap-2 font-bold">
      {icon}
      <span className="text-[#e6edf3]">{name}</span>
    </div>
    <span className="text-[9px] font-black uppercase tracking-widest text-[#10b981]">{status}</span>
  </div>
);

const StandardItem = ({ label, active = false }) => (
  <div className="flex items-center gap-2.5 text-[10px] font-black group">
    {active
      ? <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center"><CheckCircle2 size={11} className="text-emerald-500" /></div>
      : <div className="w-3.5 h-3.5 rounded-full border border-[#1f2937] bg-black/20" />}
    <span className={active ? 'text-[#e6edf3]' : 'text-[#484f58] uppercase'}>{label}</span>
  </div>
);

export default Home;
