import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  History,
  HelpCircle,
  LayoutDashboard,
  Activity,
  Users,
  Code,
  MessageSquare,
  Settings,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Link2,
  ChevronRight,
  ShieldAlert,
  RefreshCw,
  Loader2,
  ArrowLeft,
  User,
  LogOut,
  Box,
  ArrowUpRight,
  AlertCircle,
  Layers,
  Zap,
  Repeat,
  Target,
  BarChart3,
  Scale
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';
import { getGithubDashboard } from "../services/api.js";

const Dashboard = () => {
  const { owner, repo } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareIsPending, setCompareIsPending] = useState(false);
  const [error, setError] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [compareRepoInput, setCompareRepoInput] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { email: "Guest" };

  const fetchData = async (isInitial = true) => {
    if (isInitial) {
      setLoading(true);
      setError("");
    } else {
      setIsPolling(true);
    }
    
    try {
      const result = await getGithubDashboard(owner, repo);
      if (result?.repo) {
        setData(result);
        setLoading(false);
      } else if (result?._isPending) {
        // If pending on initial load, show dummy repo name if possible or just wait
        setLoading(false);
        setData(prev => ({ ...prev, _isStatsPending: true }));
      } else if (isInitial) {
        setError(result?.message || "Target acquisition failed.");
        setLoading(false);
      }
    } catch (err) {
      if (isInitial) {
        setError(err.response?.data?.message || "Communication link lost. Verify target.");
        setLoading(false);
      }
    } finally {
      setIsPolling(false);
    }
  };

  useEffect(() => {
    if (owner && repo) fetchData(true);
  }, [owner, repo]);

  // Main Data Polling
  useEffect(() => {
    let interval;
    if (data?._isStatsPending) {
      interval = setInterval(() => {
        fetchData(false);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [data?._isStatsPending, owner, repo]);

  const handleCompare = async (isPollingCall = false) => {
    let input = compareRepoInput.trim();
    if (!input) return;

    try {
      if (input.includes('github.com/')) {
        const path = input.split('github.com/')[1];
        const parts = path.split('/').filter(p => p);
        input = `${parts[0]}/${parts[1]}`;
      }
      input = input.replace(/\/$/, "").replace(/\.git$/, ""); 
    } catch (e) {
      if (!isPollingCall) alert("Invalid GitHub link format.");
      return;
    }
    
    if (!input.includes('/')) {
      if (!isPollingCall) alert("Use format: owner/repo");
      return;
    }
    
    const [cOwner, cRepo] = input.split('/');
    if (!isPollingCall) setCompareLoading(true);
    
    try {
      const result = await getGithubDashboard(cOwner, cRepo);
      if (result?.repo) {
        setCompareData(result);
        setIsComparing(true);
        setCompareIsPending(result?._isStatsPending || false);
      } else if (result?._isPending) {
        setCompareIsPending(true);
        setIsComparing(true); // Show pending state in UI
      }
    } catch (err) {
      if (!isPollingCall) alert(err.response?.data?.message || "Benchmark failed.");
    } finally {
      if (!isPollingCall) setCompareLoading(false);
    }
  };

  // Compare Polling
  useEffect(() => {
    let interval;
    if (compareIsPending && isComparing) {
      interval = setInterval(() => {
        handleCompare(true);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [compareIsPending, isComparing, compareRepoInput]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080c] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500">
            <Zap className="animate-pulse" size={32} />
          </div>
        </div>
        <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Intelligence Matrix...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#06080c] flex flex-col items-center justify-center p-8">
        <div className="bg-[#161b22] p-12 rounded-3xl border border-red-500/20 mb-8 max-w-lg w-full text-center shadow-2xl">
          <AlertCircle className="text-red-500 mx-auto mb-6" size={48} />
          <h2 className="text-2xl font-black text-white mb-4 uppercase">Target Inaccessible</h2>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">{error}</p>
          <button onClick={() => navigate("/home")} className="w-full bg-[#1f2937] hover:bg-[#374151] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all border border-white/5 shadow-lg">
            <ArrowLeft size={18} /> Return to Search
          </button>
        </div>
      </div>
    );
  }

  const repoInfo = data?.repo;
  const prMetrics = data?.pr_metrics;
  const techMetrics = data?.technical_metrics;
  const commMetrics = data?.community_metrics;
  const activityMetrics = data?.activity_metrics;
  const commitActivity = data?.commit_activity || [];
  const codeChurn = techMetrics?.code_churn || [];
  const languages = data?.languages || {};

  return (
    <div className="flex min-h-screen bg-[#06080c] text-[#e6edf3] font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-[#d1d9e1] flex-col hidden lg:flex border-r border-white/5 shrink-0 relative z-20 shadow-2xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#8957e5] rounded-xl flex items-center justify-center text-white shadow-lg rotate-3 group hover:rotate-0 transition-transform">
            <Box size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-[11px] font-black text-[#1f2328] uppercase tracking-tighter leading-tight">GITPULSE ULTRA</h2>
            <p className="text-[9px] font-bold text-indigo-600">Adaptive Engine v4.8</p>
          </div>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-1.5 mt-8">
          <button onClick={() => navigate('/home')} className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-[12px] font-black tracking-tight text-[#57606a] hover:bg-white/40 transition-all mb-6">
            <ArrowLeft size={17} /> Back to Search
          </button>
          <NavItem icon={<LayoutDashboard size={17} />} label="System Overview" active />
          <NavItem icon={<Activity size={17} />} label="Neural Velocity" />
          <NavItem icon={<Repeat size={17} />} label="Churn Matrix" />
          
          <div className="mt-10 px-4 py-6 bg-white/40 rounded-3xl border border-black/5 shadow-inner">
            <p className="text-[10px] font-black text-[#1f2328] uppercase tracking-[0.2em] mb-4">Benchmark Engine</p>
            <div className="space-y-3">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57606a]" size={12} />
                  <input 
                    type="text"
                    placeholder="e.g. facebook/react"
                    className="w-full bg-white/60 border border-black/5 rounded-xl py-3 pl-10 pr-4 text-[11px] focus:outline-none text-[#1f2328] font-bold placeholder:text-gray-400"
                    value={compareRepoInput}
                    onChange={(e) => setCompareRepoInput(e.target.value)}
                  />
               </div>
               <button 
                onClick={() => handleCompare(false)}
                disabled={compareLoading}
                className="w-full bg-[#1f2328] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
               >
                 {compareLoading ? <Loader2 size={12} className="animate-spin" /> : compareIsPending ? <RefreshCw size={12} className="animate-spin" /> : <Scale size={12} />} 
                 {compareIsPending ? "Syncing..." : "Benchmark"}
               </button>
               {isComparing && (
                 <button onClick={() => { setIsComparing(false); setCompareData(null); setCompareIsPending(false); }} className="w-full text-red-500 text-[9px] font-black uppercase tracking-widest mt-2 hover:underline">Clear Comparison</button>
               )}
            </div>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-[64px] border-b border-white/5 flex items-center justify-between px-8 shrink-0 bg-[#06080c]/80 backdrop-blur-xl z-50">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Intelligence Core</h1>
              {(isPolling || compareIsPending) && (
                <div className="flex items-center gap-2 animate-pulse">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                   <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Optimizing Matrix Layers...</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-lg cursor-pointer hover:scale-105 transition-transform" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <img src={`https://ui-avatars.com/api/?name=${user?.email || 'Guest'}&background=8957e5&color=fff&bold=true`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* HERO */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`md:col-span-2 bg-gradient-to-br from-[#0f172a] to-[#06080c] border border-[#1f2937] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group transition-all ${isComparing ? 'ring-2 ring-indigo-500/50' : ''}`}>
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-indigo-500">
                 <Box size={140} />
              </div>
              <h2 className="text-5xl font-black tracking-tighter text-white mb-10 group-hover:text-indigo-400 transition-colors">{repoInfo?.name || "Initializing..."}</h2>
              <div className="flex gap-14">
                 <HeroStat label="STARS" value={repoInfo?.stargazers_count} compareValue={isComparing ? compareData?.repo?.stargazers_count : null} />
                 <HeroStat label="BUS FACTOR" value={activityMetrics?.bus_factor} color="text-indigo-400" compareValue={isComparing ? compareData?.activity_metrics?.bus_factor : null} />
                 <HeroStat label="FORKS" value={repoInfo?.forks_count} compareValue={isComparing ? compareData?.repo?.forks_count : null} />
              </div>
            </div>

            <Panel title="VELOCITY PULSE" icon={<Zap size={16} className="text-amber-400 animate-pulse" />}>
               <div className="flex flex-col h-full justify-center space-y-6">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Lead Time</p>
                        <p className="text-4xl font-black text-white">{prMetrics?.lead_time_days || 0}<span className="text-xs text-gray-600 ml-1">D</span></p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Merge Rate</p>
                        <p className="text-3xl font-black text-emerald-400">{prMetrics?.merge_velocity || 0}%</p>
                     </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                     <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000" style={{ width: `${prMetrics?.merge_velocity || 0}%` }}></div>
                  </div>
               </div>
            </Panel>

            <Panel title="CHURN FLOW" icon={<Repeat size={16} className="text-indigo-400" />}>
               <div className="h-[120px] w-full">
                  {codeChurn?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={codeChurn}>
                        <Area type="monotone" dataKey="additions" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                        <Area type="monotone" dataKey="deletions" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center gap-3 bg-white/5 rounded-2xl border border-dashed border-white/10">
                       {data?._isStatsPending ? (
                         <>
                           <Loader2 className="animate-spin text-indigo-400" size={18} />
                           <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest text-center px-4">Calibrating Stats...</p>
                         </>
                       ) : (
                         <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center px-4">No Recent Activity Detected</p>
                       )}
                    </div>
                  )}
               </div>
            </Panel>
          </div>

          {/* HEATMAP */}
          <div className="bg-[#0f172a]/40 border border-[#1f2937] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
             <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">52-WEEK DEVELOPMENT INTENSITY</h4>
                </div>
                <div className="flex gap-4 items-center bg-white/5 px-6 py-3 rounded-2xl border border-white/5 shadow-xl">
                   <span className="text-[10px] font-black text-gray-500 uppercase">Lower</span>
                   <div className="flex gap-2">
                      {[0.1, 0.4, 0.7, 1].map(o => <div key={o} className="w-4 h-4 rounded-md" style={{ backgroundColor: '#6366f1', opacity: o }} />)}
                   </div>
                   <span className="text-[10px] font-black text-gray-500 uppercase">Higher</span>
                </div>
             </div>
             <div className="flex flex-wrap gap-2.5 justify-between min-h-[160px]">
                {commitActivity?.length > 0 ? commitActivity.map((week, i) => (
                   <div key={i} className="flex flex-col gap-2.5">
                      {week?.days?.map((count, j) => (
                         <div 
                           key={j} 
                           className={`w-4 h-4 rounded-md transition-all duration-300 hover:scale-[2] hover:z-50 cursor-pointer relative group/square ${
                             count === 0 ? 'bg-[#1f2937]/50' : 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                           }`}
                           style={{ opacity: count === 0 ? 0.2 : Math.min(0.2 + (count/10), 1) }}
                         >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 hidden group-hover/square:block bg-[#1e293b] text-white text-[10px] font-black px-4 py-2 rounded-xl border border-white/10 z-[100] whitespace-nowrap shadow-2xl animate-in fade-in zoom-in-95">
                               {count} Commits
                            </div>
                         </div>
                      ))}
                   </div>
                )) : (
                    <div className="w-full h-40 flex flex-col items-center justify-center gap-4 bg-white/5 rounded-3xl border border-dashed border-white/10 shadow-inner">
                       {data?._isStatsPending ? (
                         <>
                           <Loader2 className="animate-spin text-indigo-500" size={32} />
                           <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Sourcing Matrix Intensity...</p>
                         </>
                       ) : (
                         <p className="text-[12px] font-black text-gray-500 uppercase tracking-widest">No Activity Matrix Recorded</p>
                       )}
                    </div>
                )}
             </div>
          </div>

          {/* GRID SECONDARY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-[#0f172a]/40 border border-[#1f2937] rounded-[2rem] p-10 flex flex-col items-center text-center shadow-2xl relative group overflow-hidden">
                <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] self-start mb-12">STABILITY INDEX</h4>
                <div className="relative w-52 h-52 flex items-center justify-center mb-12 group-hover:scale-105 transition-transform duration-700">
                   <svg className="w-full h-full -rotate-90">
                      <circle cx="104" cy="104" r="96" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="16" />
                      <circle 
                        cx="104" cy="104" r="96" fill="transparent" stroke="#6366f1" strokeWidth="16" 
                        strokeDasharray={603} strokeDashoffset={603 - (603 * Math.min((activityMetrics?.bus_factor || 1) / 10, 1))} 
                        strokeLinecap="round" className="transition-all duration-1000 shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                      />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-6xl font-black text-white leading-none tracking-tighter">{activityMetrics?.bus_factor || 0}</p>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-3">Bus Factor</p>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <Panel title="TECH STACK CORE" icon={<Code size={18} className="text-indigo-400" />}>
                   <div className="flex flex-wrap gap-4 py-4">
                      {Object.entries(languages || {}).slice(0, 6).map(([name, bytes], i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/5 px-5 py-2.5 rounded-2xl shadow-xl hover:bg-white/10 transition-all cursor-default">
                           <span className="w-2 h-2 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)]" style={{ backgroundColor: i % 2 === 0 ? '#6366f1' : '#a855f7' }}></span>
                           <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">{name}</span>
                        </div>
                      ))}
                   </div>
                </Panel>
                <Panel title="CONTRIBUTOR MATRIX" icon={<Users size={18} className="text-purple-400" />}>
                   <div className="space-y-5 py-2">
                      {(commMetrics?.contributor_leaderboard || []).slice(0, 4).map((c, i) => (
                        <div key={i} className="flex justify-between items-center group/item hover:bg-white/5 p-2 rounded-xl transition-all">
                           <div className="flex items-center gap-4">
                              <img src={c?.avatar_url} alt="" className="w-10 h-10 rounded-xl border border-white/10 shadow-lg group-hover/item:scale-110 transition-transform" />
                              <span className="text-[13px] font-black text-gray-200 uppercase tracking-tighter">{c?.login}</span>
                           </div>
                           <span className="text-[12px] font-black text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-xl border border-indigo-500/20">{c?.contributions}</span>
                        </div>
                      ))}
                   </div>
                </Panel>
             </div>

             <div className="space-y-6">
                <Panel title="QUALITY STANDARDS" icon={<ShieldCheck size={18} className="text-emerald-400" />}>
                   <div className="space-y-8 py-4">
                      <ProgressBar label="Readme Documentation" score={commMetrics?.readme_score || 0} color="from-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
                      <ProgressBar label="Community Integrity" score={commMetrics?.community_health_files?.score || 0} color="from-emerald-500 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                   </div>
                </Panel>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// HELPERS
const NavItem = ({ icon, label, active = false }) => (
  <a href="#" className={`flex items-center gap-5 px-6 py-4 rounded-[1.2rem] text-[13px] font-black tracking-tight transition-all relative group ${
    active ? 'bg-[#1f2328] text-white shadow-2xl shadow-black/40 border border-white/5' : 'text-[#57606a] hover:bg-white/50 hover:text-[#1f2328]'
  }`}>
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_15px_rgba(99,102,241,0.8)]"></div>}
    <span className={active ? 'text-indigo-400' : 'group-hover:text-indigo-600 transition-colors'}>{icon}</span> {label}
  </a>
);

const HeroStat = ({ label, value, color = "text-white", compareValue = null }) => (
  <div className="flex flex-col relative group/stat">
    <span className="text-[10px] font-black text-[#64748b] tracking-[0.4em] mb-3 uppercase leading-none">{label}</span>
    <div className="flex items-baseline gap-4">
       <span className={`text-5xl font-black tracking-tighter ${color} leading-none`}>{Intl.NumberFormat('en', { notation: 'compact' }).format(value || 0)}</span>
       {compareValue !== null && (
         <div className={`flex items-center gap-1 text-[13px] font-black px-3 py-1 rounded-xl border animate-in slide-in-from-left-2 ${compareValue > (value || 0) ? 'text-red-400 border-red-500/20 bg-red-500/5' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'}`}>
            <ArrowUpRight size={14} className={compareValue > (value || 0) ? 'rotate-90' : 'rotate-0'} />
            {Intl.NumberFormat('en', { notation: 'compact' }).format(Math.abs(compareValue - (value || 0)))}
         </div>
       )}
    </div>
  </div>
);

const Panel = ({ title, icon, children }) => (
  <div className="bg-[#0f172a]/40 border border-[#1f2937] rounded-[2rem] p-10 flex flex-col shadow-2xl backdrop-blur-xl group hover:border-[#1f2937]/80 transition-all min-h-[250px]">
    <div className="flex justify-between items-center mb-10">
      <h4 className="text-[11px] font-black text-[#64748b] uppercase tracking-[0.4em]">{title}</h4>
      <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all shadow-lg">{icon}</div>
    </div>
    <div className="flex-1 flex flex-col justify-center">{children}</div>
  </div>
);

const ProgressBar = ({ label, score, color }) => (
  <div className="group/progress">
    <div className="flex justify-between text-[11px] font-black mb-4 uppercase text-[#64748b] tracking-[0.3em] group-hover/progress:text-white transition-colors">
      <span>{label}</span>
      <span className="text-white bg-white/5 px-3 py-1 rounded-xl border border-white/10">{score}%</span>
    </div>
    <div className="h-3 bg-[#1f2937] rounded-full overflow-hidden p-1 shadow-inner border border-white/5">
      <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000`} style={{ width: `${score}%` }}></div>
    </div>
  </div>
);

export default Dashboard;
