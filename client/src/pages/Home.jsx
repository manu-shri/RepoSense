import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, History, HelpCircle, LayoutDashboard, Activity, Users, Code,
  Settings, ShieldCheck, Box, TrendingUp, Link2, ChevronRight, RefreshCw,
  Loader2, LogOut, Zap, Repeat, GitMerge, GitPullRequest, ShieldAlert,
  Clock, Package, FileText, CheckCircle2, Terminal, Cpu, Globe, Sparkles, Stethoscope, Gauge
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
    // Initial fetch - RUNS ONLY ONCE
    handleAnalyze("https://github.com/manu-shri/RepoSense.git", true);
  }, [navigate]);

  const handleAnalyze = async (manualUrl = null, isInitial = false) => {
    const urlToUse = (manualUrl || repoUrl).trim();
    if (!urlToUse) return;

    let cleanUrl = urlToUse.split('?')[0].split('#')[0];
    cleanUrl = cleanUrl.replace(/^(http|https):\/\//, "").replace(/\/$/, "").replace(/\.git$/, "");
    const segments = cleanUrl.split("/");
    let owner, repo;

    if (segments[0].includes("github.com") && segments.length >= 3) {
      [owner, repo] = [segments[1], segments[2]];
    } else if (segments.length === 2) {
      [owner, repo] = segments;
    } else {
      if (!isInitial) setError("Invalid Target.");
      return;
    }

    if (!isInitial) setLoading(true);
    setError("");

    try {
      const result = await getGithubDashboard(owner, repo);
      if (result) {
        setData(prev => ({
          ...prev,
          ...result,
          repo: { ...prev.repo, ...(result.repo || {}), updated_at: new Date().toISOString() }
        }));
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(`Neural Link Fault: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-[70px] border-b border-white/5 flex items-center justify-between px-8 shrink-0 bg-[#020617]/50 backdrop-blur-xl z-50">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">GitPulse AI</h1>
          </div>
          <div className="flex items-center gap-6 relative">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 cursor-pointer shadow-lg" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <img src={`https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff&bold=true`} className="w-full h-full object-cover" />
            </div>

            {/* PROFILE DROPDOWN */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-14 right-0 w-48 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
                >
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-xs font-bold text-white truncate">{user.email}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Operator</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-xs text-red-400 hover:bg-white/5 transition-colors font-black uppercase tracking-[0.1em] w-full text-left"
                  >
                    <LogOut size={16} />
                    System Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative z-10">
          {/* TARGET ACQUISITION */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2.5 mb-5 px-1">
              <Zap className="text-indigo-500 animate-pulse" size={16} />
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Neural Target Acquisition</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="Target repository..."
                  className="w-full bg-[#020617] border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white font-bold placeholder:text-gray-600"
                />
              </div>
              <button
                onClick={() => handleAnalyze()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 min-w-[180px]"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Activity size={18} />}
                {loading ? "Acquiring..." : "Analyze Target"}
              </button>
            </div>
            {error && <p className="text-[10px] text-red-500 font-black mt-3 uppercase tracking-widest ml-1">{error}</p>}
          </GlassCard>

          {/* REPO HEADER */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-[2.5rem] p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            <div className="flex-1">
              <h2 className="text-3xl font-black tracking-tight text-white uppercase italic mb-2">{data.repo.name}</h2>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">
                {data.repo.full_name} • <span className="text-indigo-400">{data.repo.default_branch}</span> • Updated {new Date(data.repo.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-12">
              <HeaderStat label="STARS" value={data.repo.stargazers_count} />
              <HeaderStat label="FORKS" value={data.repo.forks_count} />
              <HeaderStat label="HEALTH" value={data.ai_insights.health_grade} color="text-indigo-400" />
            </div>
          </motion.div>

          {/* ANALYTICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <GlassCard className="p-8 flex flex-col items-center text-center">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] self-start mb-8">Neural Health</h4>
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90"><circle cx="88" cy="88" r="80" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="10" /><circle cx="88" cy="88" r="80" fill="transparent" stroke={data.ai_insights.health_color} strokeWidth="10" strokeDasharray={502} strokeDashoffset={502 * 0.1} strokeLinecap="round" /></svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black italic text-white">{data.ai_insights.health_grade}</span>
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{data.ai_insights.health_label}</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="md:col-span-2 p-8">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">PR LIFECYCLE</h4>
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="w-[160px] h-[160px]">
                  <ResponsiveContainer><PieChart><Pie data={[{ name: 'Merged', value: data.pr_metrics.merged_prs || 0.1 }, { name: 'Open', value: data.pr_metrics.open_prs || 0.1 }]} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value"><Cell fill="#8957e5" /><Cell fill="#1e293b" /></Pie><Tooltip /></PieChart></ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-8 flex-1">
                  <MetricBox label="Open PRs" value={data.pr_metrics.open_prs} />
                  <MetricBox label="Merged PRs" value={data.pr_metrics.merged_prs} />
                  <MetricBox label="Velocity" value={`${data.pr_metrics.merge_velocity}%`} color="text-indigo-400" />
                  <MetricBox label="Lead Time" value={`${data.pr_metrics.lead_time_days}d`} />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-8">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Resolution Velocity</h4>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-2"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Efficiency</span><span className="text-xs font-black text-white italic">{data.ai_insights.resolution_rate}%</span></div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${data.ai_insights.resolution_rate}%` }} className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" /></div>
                </div>
                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                  <div><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Stale Issues</p><p className="text-2xl font-black text-red-400">{data.ai_insights.stale_issues_count}</p></div>
                  <ShieldAlert className="text-red-500/30" size={32} />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="md:col-span-3 p-8">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-10">COMMIT VELOCITY (30D)</h4>
              <div className="h-[200px] w-full">
                <ResponsiveContainer>
                  <BarChart data={data.activity_metrics.commit_activity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis hide /><YAxis hide /><Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="p-8">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Security Matrix</h4>
              <div className="space-y-6">
                <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><ShieldCheck size={24} /></div><div><p className="text-xl font-black text-white">98%</p><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Score</p></div></div>
                <div className="grid grid-cols-2 gap-4"><StatusBadge label="Snyk" active /><StatusBadge label="Dependabot" active /><StatusBadge label="CodeQL" active /><StatusBadge label="Secrets" active /></div>
              </div>
            </GlassCard>

            <GlassCard className="md:col-span-2 p-8">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">CODE CHURN ANALYTICS</h4>
              <div className="h-[200px] w-full">
                <ResponsiveContainer>
                  <AreaChart data={data.technical_metrics.code_churn}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
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
                  <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${Math.max(10, v * 30)}%` }} className={`flex-1 rounded-sm ${v > 0 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/5'}`} />
                ))}
              </div>
              <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase tracking-widest"><span>00:00</span><span>12:00</span><span>23:59</span></div>
            </GlassCard>

            <GlassCard className="p-8">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Infrastructure</h4>
              <div className="space-y-6">
                <div className="flex justify-between items-center"><div><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Pipeline</p><p className="text-xl font-black text-emerald-400">{data.ai_insights.pipeline_health}%</p></div><CheckCircle2 className="text-emerald-500" size={24} /></div>
                <div className="pt-6 border-t border-white/5">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Latest Release</p>
                  <div className="flex items-center gap-3"><Package size={20} className="text-indigo-400" /><span className="text-sm font-black text-white truncate">{data.technical_metrics.latest_release}</span></div>
                </div>
              </div>
            </GlassCard>
          </div>
        </main>
      </div>
  );
};

// HELPERS
const GlassCard = ({ children, className = "" }) => <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-3xl shadow-xl transition-all duration-500 ${className}`}>{children}</motion.div>;
const HeaderStat = ({ label, value, color = "text-white" }) => <div className="flex flex-col items-center"><span className="text-[10px] font-black text-gray-500 tracking-[0.2em] mb-2 uppercase leading-none">{label}</span><span className={`text-2xl font-black italic tracking-tighter ${color}`}>{typeof value === 'string' ? value : Intl.NumberFormat('en', { notation: 'compact' }).format(value || 0)}</span></div>;
const MetricBox = ({ label, value, color = "text-white" }) => <div><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p><p className={`text-xl font-black italic ${color}`}>{value}</p></div>;
const StatusBadge = ({ label, active = false }) => <div className={`px-2 py-1.5 rounded-lg border flex items-center justify-center gap-2 ${active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-600'}`}><div className={`w-1 h-1 rounded-full ${active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-gray-700'}`} /><span className="text-[9px] font-black uppercase tracking-tighter">{label}</span></div>;

const SyncingSkeleton = ({ label = "Sourcing Matrix..." }) => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-4 py-8">
    <Loader2 className="text-indigo-500 animate-spin" size={24} />
    <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] animate-pulse">{label}</span>
  </div>
);

export default Home;
