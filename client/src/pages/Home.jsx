import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, History, HelpCircle, LayoutDashboard, Activity, Users, Code,
  Settings, ShieldCheck, Box, TrendingUp, Link2, ChevronRight, RefreshCw,
  Loader2, LogOut, Zap, Repeat, GitMerge, GitPullRequest, ShieldAlert,
  Clock, Package, FileText, CheckCircle2, Terminal, Cpu, Globe
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import { getGithubDashboard } from "../services/api.js";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [repoUrl, setRepoUrl] = useState("https://github.com/manu-shri/RepoSense.git");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isStatsPending, setIsStatsPending] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [data, setData] = useState({
    repo: { full_name: "manu-shri/RepoSense", name: "RepoSense", stargazers_count: 0, forks_count: 0, open_issues_count: 0, updated_at: new Date().toISOString(), default_branch: "main" },
    ai_insights: { health_grade: "A+", health_label: "Exemplary", health_color: "#8957e5", doc_score: 0, resolution_rate: 0, stale_issues_count: 0, pipeline_health: 0, bus_factor: 0 },
    pr_metrics: { merged_prs: 0, open_prs: 0, merge_velocity: 0, lead_time_days: 0 },
    technical_metrics: { code_churn: [], languages: {}, latest_release: "N/A" },
    activity_metrics: { commit_activity: [], peak_hours: new Array(24).fill(0), top_contributors: [] },
    community_standards: { readme: true, license: true, contributing: false, security: false }
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/login"); return; }
    setUser(JSON.parse(stored));
    handleAnalyze("https://github.com/manu-shri/RepoSense.git", true);
  }, [navigate]);

  const handleAnalyze = async (manualUrl = null, isInitial = false) => {
    const urlToUse = (manualUrl || repoUrl).trim();
    if (!urlToUse) return setError("Analysis target required.");

    const cleanUrl = urlToUse.replace(/^(http|https):\/\//, "").replace(/\/$/, "").replace(/\.git$/, "");
    const segments = cleanUrl.split("/");
    let owner, repo;

    if (segments[0].includes("github.com") && segments.length >= 3) {
      [owner, repo] = [segments[1], segments[2]];
    } else if (segments.length === 2) {
      [owner, repo] = segments;
    } else {
      setError("Invalid target format. Use owner/repo or GitHub link.");
      return;
    }

    if (!isInitial) setLoading(true);
    setError("");

    try {
      const result = await getGithubDashboard(owner, repo);
      if (result?.repo || result?._isPending) {
        setData(prev => ({
          ...prev,
          ...(result?.repo ? result : {}),
          repo: { ...prev.repo, ...(result?.repo || {}), updated_at: new Date().toISOString() }
        }));
        setIsStatsPending(result?._isStatsPending || result?._isPending || false);
      }
    } catch (err) {
      setError(err.code === 'ECONNABORTED' ? "Deep sync taking longer than expected..." : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (isStatsPending) {
      interval = setInterval(() => {
        const [owner, repo] = data.repo.full_name.split('/');
        handleAnalyze(`${owner}/${repo}`, true);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isStatsPending, data.repo.full_name]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#020617] text-[#e6edf3] font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-[#020617] flex-col hidden lg:flex border-r border-white/5 shrink-0 relative z-20">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            <Cpu size={22} strokeWidth={2.5} />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm font-black text-white uppercase tracking-widest leading-tight truncate">OCTOCORE</h2>
            <p className="text-[10px] font-bold text-indigo-400/60 tracking-widest">NEURAL v2.4</p>
          </div>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-2 mt-4">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Overview" active />
          <SidebarItem icon={<ShieldCheck size={18} />} label="Neural Health" />
          <SidebarItem icon={<Activity size={18} />} label="Velocity" />
          <SidebarItem icon={<Globe size={18} />} label="Ecosystem" />
          <SidebarItem icon={<Terminal size={18} />} label="Deployments" />
        </nav>
        <div className="p-6">
          <SidebarItem icon={<LogOut size={18} />} label="Sign Out" onClick={handleLogout} />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-[70px] border-b border-white/5 flex items-center justify-between px-8 shrink-0 bg-[#020617]/50 backdrop-blur-xl z-50">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">GitPulse AI</h1>
          </div>
          <div className="flex items-center gap-6">
            {isStatsPending && (
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full animate-pulse">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Neural Indexing...</span>
              </div>
            )}
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 cursor-pointer shadow-lg" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <img src={`https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff&bold=true`} className="w-full h-full object-cover" />
            </div>
            {showProfileMenu && (
              <div className="absolute top-14 right-8 w-56 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-[100] py-2">
                <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-2 font-bold uppercase tracking-widest">
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative z-10">
          {/* ANALYSIS CONTROL CENTER */}
          <motion.section 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-3xl p-6 shadow-2xl relative group"
          >
            <div className="flex items-center gap-2.5 mb-5 px-1">
              <Zap className="text-indigo-500 animate-pulse" size={16} />
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Neural Target Acquisition</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-indigo-400 transition-colors">
                  <Link2 size={18} />
                </div>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="Enter repository URL (e.g., owner/repo)..."
                  className="w-full bg-[#020617] border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white font-bold placeholder:text-gray-600 shadow-inner"
                />
              </div>
              <button
                onClick={() => handleAnalyze()}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 min-w-[180px]"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Activity size={18} />}
                {loading ? "Acquiring..." : "Analyze Target"}
              </button>
            </div>
            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-500 font-black mt-3 uppercase tracking-widest ml-1">{error}</motion.p>}
          </motion.section>

          {/* REPOSITORY HEADER CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-[2.5rem] p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">{data.repo.name || "Syncing"}</h2>
                <div className={`px-3 py-1 border rounded-lg flex items-center gap-2 transition-all ${isStatsPending ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isStatsPending ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'}`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isStatsPending ? 'Indexing Matrix' : 'Target Locked'}</span>
                </div>
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">
                {data.repo.full_name} • <span className="text-indigo-400">{data.repo.default_branch}</span> branch • Updated {new Date(data.repo.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-12">
              <HeaderStat label="STARS" value={data.repo.stargazers_count} />
              <HeaderStat label="FORKS" value={data.repo.forks_count} />
              <HeaderStat label="BUS FACTOR" value={data.ai_insights.bus_factor} color="text-purple-400" />
            </div>
          </motion.div>

          {/* KPI GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <GlassCard className="flex flex-col items-center text-center p-8 lg:col-span-1">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] self-start mb-8">Neural Health Index</h4>
              <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="96" cy="96" r="88" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                  <motion.circle 
                    initial={{ strokeDashoffset: 552 }} animate={{ strokeDashoffset: 552 - (552 * 0.95) }}
                    cx="96" cy="96" r="88" fill="transparent" stroke={data.ai_insights.health_color} strokeWidth="12" 
                    strokeDasharray={552} strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black italic text-white">{data.ai_insights.health_grade}</span>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">{data.ai_insights.health_label}</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="md:col-span-2 p-8">
               <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">PR LIFECYCLE ANALYTICS</h4>
               <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="w-[180px] h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[{ name: 'Merged', value: data.pr_metrics.merged_prs }, { name: 'Open', value: data.pr_metrics.open_prs }]} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          <Cell fill="#8957e5" />
                          <Cell fill="#1e293b" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-8 flex-1">
                    <MetricBox label="Open PRs" value={data.pr_metrics.open_prs} />
                    <MetricBox label="Merged PRs" value={data.pr_metrics.merged_prs} />
                    <MetricBox label="Merge Velocity" value={`${data.pr_metrics.merge_velocity}%`} color="text-indigo-400" />
                    <MetricBox label="Avg Merge Time" value={`${data.pr_metrics.lead_time_days}d`} />
                  </div>
               </div>
            </GlassCard>

            <GlassCard className="p-8">
               <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Resolution Velocity</h4>
               <div className="space-y-8">
                  <div>
                    <div className="flex justify-between mb-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Efficiency</span>
                       <span className="text-xs font-black text-white italic">{data.ai_insights.resolution_rate}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${data.ai_insights.resolution_rate}%` }} className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center">
                       <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Stale Issues</p>
                          <p className="text-2xl font-black text-red-400">{data.ai_insights.stale_issues_count}</p>
                       </div>
                       <ShieldAlert className="text-red-500/40" size={32} />
                    </div>
                  </div>
               </div>
            </GlassCard>

            <GlassCard className="md:col-span-3 p-8">
               <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-10">COMMIT VELOCITY (30D)</h4>
               <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.activity_metrics.commit_activity.slice(-20)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="week" hide />
                      <YAxis hide />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                      <Bar dataKey="total" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8957e5" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </GlassCard>

            <GlassCard className="p-8">
               <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Security Matrix</h4>
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                       <ShieldCheck size={24} />
                    </div>
                    <div>
                       <p className="text-xl font-black text-white">98%</p>
                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Health Score</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <StatusBadge label="Snyk" active />
                     <StatusBadge label="Dependabot" active />
                     <StatusBadge label="CodeQL" active />
                     <StatusBadge label="Secrets" active />
                  </div>
               </div>
            </GlassCard>

            <GlassCard className="md:col-span-2 p-8">
               <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">CODE CHURN ANALYTICS</h4>
               <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.technical_metrics.code_churn}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis hide />
                      <YAxis hide />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="additions" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                      <Area type="monotone" dataKey="deletions" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </GlassCard>

            <GlassCard className="p-8">
               <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Peak Coding Hours</h4>
               <div className="h-[120px] flex items-end gap-1 mb-6">
                  {data.activity_metrics.peak_hours.map((v, i) => (
                    <motion.div 
                      key={i} initial={{ height: 0 }} animate={{ height: `${Math.max(10, v * 20)}%` }}
                      className={`flex-1 rounded-sm ${v > 5 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/5'}`}
                    />
                  ))}
               </div>
               <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase tracking-widest">
                  <span>00:00</span>
                  <span>12:00</span>
                  <span>23:59</span>
               </div>
               <p className="text-[10px] text-indigo-400 mt-4 font-bold italic">Peak window: 16:00 - 20:00</p>
            </GlassCard>

            <GlassCard className="p-8">
               <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Infrastructure</h4>
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Pipeline Health</p>
                        <p className="text-xl font-black text-emerald-400">{data.ai_insights.pipeline_health}%</p>
                     </div>
                     <CheckCircle2 className="text-emerald-500" size={24} />
                  </div>
                  <div className="pt-6 border-t border-white/5">
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Latest Release</p>
                     <div className="flex items-center gap-3">
                        <Package size={20} className="text-indigo-400" />
                        <span className="text-sm font-black text-white">{data.technical_metrics.latest_release}</span>
                     </div>
                  </div>
               </div>
            </GlassCard>

            <GlassCard className="p-8">
               <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Tech Stack Core</h4>
               <div className="flex flex-wrap gap-2">
                  {Object.entries(data.technical_metrics.languages).slice(0, 4).map(([name], i) => (
                    <div key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                       <span className="text-[10px] font-black text-gray-300 uppercase tracking-tight">{name}</span>
                    </div>
                  ))}
               </div>
            </GlassCard>

            <GlassCard className="p-8">
               <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Community Standards</h4>
               <div className="grid grid-cols-2 gap-4">
                  <StandardItem label="README" active={data.community_standards.readme} />
                  <StandardItem label="License" active={data.community_standards.license} />
                  <StandardItem label="Contributing" active={data.community_standards.contributing} />
                  <StandardItem label="Security" active={data.community_standards.security} />
               </div>
            </GlassCard>

            <GlassCard className="p-8">
               <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Core Contributors</h4>
               <div className="space-y-4">
                  {data.activity_metrics.top_contributors.map((c, i) => (
                    <div key={i} className="flex justify-between items-center">
                       <div className="flex items-center gap-3">
                          <img src={c.avatar_url} className="w-6 h-6 rounded-lg border border-white/10" />
                          <span className="text-xs font-bold text-gray-300">{c.login}</span>
                       </div>
                       <span className="text-[10px] font-black text-indigo-400">{c.contributions}</span>
                    </div>
                  ))}
               </div>
            </GlassCard>

          </div>
        </main>
      </div>
    </div>
  );
};

const GlassCard = ({ children, className = "" }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
    className={`bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-3xl shadow-xl hover:border-white/10 transition-all duration-500 ${className}`}
  >
    {children}
  </motion.div>
);

const SidebarItem = ({ icon, label, active = false, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs font-black tracking-widest transition-all ${active 
      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
      : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
  >
    <span className={active ? 'text-indigo-400' : 'text-gray-600'}>{icon}</span>
    <span className="uppercase">{label}</span>
  </button>
);

const HeaderStat = ({ label, value, color = "text-white" }) => (
  <div className="flex flex-col items-center">
    <span className="text-[10px] font-black text-gray-500 tracking-[0.2em] mb-2 uppercase leading-none">{label}</span>
    <span className={`text-2xl font-black italic tracking-tighter ${color}`}>{Intl.NumberFormat('en', { notation: 'compact' }).format(value || 0)}</span>
  </div>
);

const MetricBox = ({ label, value, color = "text-white" }) => (
  <div>
    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-xl font-black italic ${color}`}>{value}</p>
  </div>
);

const StatusBadge = ({ label, active = false }) => (
  <div className={`px-2 py-1.5 rounded-lg border flex items-center justify-center gap-2 ${active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-600'}`}>
     <div className={`w-1 h-1 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-700'}`} />
     <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
  </div>
);

const StandardItem = ({ label, active = false }) => (
  <div className="flex items-center gap-3">
     <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${active ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' : 'bg-white/5 border-white/10 text-gray-700'}`}>
        {active && <CheckCircle2 size={10} />}
     </div>
     <span className={`text-[10px] font-black uppercase tracking-tight ${active ? 'text-white' : 'text-gray-600'}`}>{label}</span>
  </div>
);

export default Home;
