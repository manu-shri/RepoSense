import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Sparkles, Stethoscope, Gauge, LogOut, Cpu,
  Search, Link2, Activity, Zap, TrendingUp, ShieldAlert, Clock, 
  ChevronRight, ArrowRight, Layers, Box, Globe, Loader2, GitBranch,
  Trophy, Swords, Target, BarChart3
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, Cell, PieChart, Pie, Treemap, CartesianGrid
} from "recharts";
import { getBenchmark } from "../services/api.js";

const Benchmark = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  
  const [primaryRepo, setPrimaryRepo] = useState(null);
  const [targetRepo, setTargetRepo] = useState(null);
  const [targetUrl, setTargetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/login"); return; }
    setUser(JSON.parse(stored));

    const owner = searchParams.get("owner") || "manu-shri";
    const repo = searchParams.get("repo") || "RepoSense";
    loadPrimary(owner, repo);
  }, []);

  const loadPrimary = async (owner, repo) => {
    try {
      const data = await getBenchmark(owner, repo);
      setPrimaryRepo(data);
    } catch (err) {}
  };

  const parseRepoUrl = (url) => {
    if (!url) return null;
    let clean = url.trim().replace(/^(http|https):\/\//, "").replace(/\/$/, "").replace(/\.git$/, "");
    clean = clean.replace(/^git@github\.com:/, "github.com/");
    const segments = clean.split("/");
    if (segments[0].includes("github.com") && segments.length >= 3) return { owner: segments[1], repo: segments[2] };
    if (segments.length === 2) return { owner: segments[0], repo: segments[1] };
    return null;
  };

  const handleRunBenchmark = async () => {
    if (!targetUrl) return;
    if (!primaryRepo) {
      setError("Waiting for Primary Instance to load...");
      return;
    }
    setError("");
    setLoading(true);
    const parsed = parseRepoUrl(targetUrl);
    if (!parsed) { setError("Invalid Format."); setLoading(false); return; }
    try {
      const data = await getBenchmark(parsed.owner, parsed.repo);
      setTargetRepo(data);
    } catch (err) {
      setError(err.response?.data?.message || "Link Fault.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar relative bg-[radial-gradient(circle_at_50%_-20%,_rgba(79,70,229,0.05),_transparent)]">
        <header className="h-[70px] border-b border-white/5 flex items-center justify-between px-10 shrink-0 sticky top-0 bg-[#020617]/80 backdrop-blur-xl z-50">
          <div className="flex items-center gap-3">
            <Swords className="text-indigo-500" size={20} />
            <h1 className="text-sm font-black tracking-[0.3em] text-white uppercase italic">Neural Battle Engine</h1>
          </div>
          {targetRepo && (
            <div className="flex items-center gap-4 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Analysis Synchronized</span>
            </div>
          )}
        </header>

        <div className="p-10 space-y-12 max-w-[1600px] mx-auto w-full pb-32">
          
          {/* TOP BATTLE CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <RepoBattleCard data={primaryRepo} side="left" loading={!primaryRepo} title="PRIMARY INSTANCE" />
            <div className="space-y-6">
               <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2">TARGET ACQUISITION</h3>
               <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all" />
                  <div className="relative">
                    <Link2 className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleRunBenchmark()}
                      placeholder="Paste target repo URL..."
                      className="w-full bg-[#020617] border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white font-bold placeholder:text-gray-700"
                    />
                  </div>
                  <button 
                    onClick={handleRunBenchmark}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-[0_0_30px_rgba(79,70,229,0.2)] flex items-center justify-center gap-4"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} />}
                    {loading ? "Crunching..." : "Engage Benchmark"}
                  </button>
                  {error && <p className="text-[10px] text-pink-500 font-black uppercase text-center">{error}</p>}
               </div>
               {targetRepo && <RepoBattleCard data={targetRepo} side="right" title="ACTIVE TARGET" />}
            </div>
          </div>

          <AnimatePresence>
            {(primaryRepo && targetRepo) && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-20">
                
                {/* 1. ARCHITECTURE BATTLE */}
                <SectionHeader icon={<Layers size={22} />} title="Engineering Complexity" desc="Structural depth and module density comparison." />
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                   <div className="lg:col-span-3 bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-10 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(79,70,229,0.03),_transparent)]" />
                      <div className="h-[400px] w-full relative z-10">
                        <ResponsiveContainer>
                          <RadarChart data={[
                            { subject: 'Depth', A: primaryRepo.complexity.folder_depth * 10, B: targetRepo.complexity.folder_depth * 10 },
                            { subject: 'Density', A: Math.min(100, primaryRepo.complexity.total_files / 5), B: Math.min(100, targetRepo.complexity.total_files / 5) },
                            { subject: 'Risk', A: 100 - primaryRepo.risk.score, B: 100 - targetRepo.risk.score },
                            { subject: 'Velocity', A: primaryRepo.velocity.score, B: targetRepo.velocity.score },
                            { subject: 'Growth', A: primaryRepo.growth.score, B: targetRepo.growth.score }
                          ]}>
                            <PolarGrid stroke="rgba(255,255,255,0.05)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900 }} />
                            <Radar name="Primary" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                            <Radar name="Target" dataKey="B" stroke="#ec4899" fill="#ec4899" fillOpacity={0.4} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                   <div className="lg:col-span-2 space-y-8">
                      <ComparisonStat label="Total Architecture Scale" valA={primaryRepo.complexity.total_files} valB={targetRepo.complexity.total_files} unit="Files" />
                      <ComparisonStat label="Module Nesting Depth" valA={primaryRepo.complexity.folder_depth} valB={targetRepo.complexity.folder_depth} unit="Layers" />
                      <div className="bg-indigo-500/5 border border-indigo-500/10 p-8 rounded-[2rem]">
                         <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Engineering Verdict</p>
                         <h4 className="text-2xl font-black text-white italic">
                           {primaryRepo.complexity.score > targetRepo.complexity.score ? 'Primary shows higher sophistication' : 'Target has more complex structure'}
                         </h4>
                      </div>
                   </div>
                </div>

                {/* 2. RISK & SECURITY */}
                <SectionHeader icon={<ShieldAlert size={22} />} title="Dependency & Risk Risk" desc="Vulnerability exposure and dependency freshness." />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                   <MiniBattleStat label="DEPS COUNT" valA={primaryRepo.risk.dependency_count} valB={targetRepo.risk.dependency_count} />
                   <MiniBattleStat label="VULNERABILITIES" valA={primaryRepo.risk.vulnerabilities} valB={targetRepo.risk.vulnerabilities} invert />
                   <div className="md:col-span-2 bg-white/[0.01] border border-white/5 rounded-[2rem] p-8 flex items-center justify-around">
                      <CircularScore score={primaryRepo.risk.score} label="Primary Risk" color="#6366f1" />
                      <div className="h-12 w-px bg-white/5" />
                      <CircularScore score={targetRepo.risk.score} label="Target Risk" color="#ec4899" />
                   </div>
                </div>

                {/* 3. GROWTH PULSE */}
                <SectionHeader icon={<TrendingUp size={22} />} title="Growth & Evolution" desc="12-week comparative activity and contributor velocity." />
                <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-12 shadow-inner relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:40px_40px]" />
                   <div className="h-[400px] w-full relative z-10">
                      <ResponsiveContainer>
                        <AreaChart data={primaryRepo.growth.activity_stats.map((s, i) => ({
                          week: i + 1,
                          A: s.total || Math.floor(Math.random() * 2),
                          B: targetRepo.growth.activity_stats[i]?.total || Math.floor(Math.random() * 2)
                        }))}>
                          <defs>
                            <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                            <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/><stop offset="95%" stopColor="#ec4899" stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis dataKey="week" hide /><YAxis hide domain={[0, 'dataMax + 5']} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                          <Area type="monotone" dataKey="A" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorA)" />
                          <Area type="monotone" dataKey="B" stroke="#ec4899" strokeWidth={4} fillOpacity={1} fill="url(#colorB)" />
                        </AreaChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="mt-8 flex justify-between px-4">
                      <div className="flex items-center gap-4">
                         <div className="w-4 h-4 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{primaryRepo.repo.name} PULSE</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{targetRepo.repo.name} PULSE</span>
                         <div className="w-4 h-4 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
                      </div>
                   </div>
                </div>

                {/* 4. VELOCITY BARS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="space-y-8">
                      <SectionHeader icon={<Zap size={22} />} title="Innovation Velocity" desc="Feature delivery and release frequency." />
                      <div className="bg-white/[0.01] border border-white/5 rounded-[2rem] p-10 space-y-10">
                         <VersusBar label="PR THROUGHPUT" valA={primaryRepo.velocity.pr_throughput} valB={targetRepo.velocity.pr_throughput} />
                         <VersusBar label="COMMIT DENSITY" valA={primaryRepo.velocity.commit_count} valB={targetRepo.velocity.commit_count} />
                      </div>
                   </div>
                   <div className="space-y-8">
                      <SectionHeader icon={<Users size={22} />} title="Community Power" desc="Collaboration depth and retention." />
                      <div className="grid grid-cols-2 gap-6 h-full">
                         <StatTile label="Contributors" value={primaryRepo.growth.contributor_count} color="text-indigo-400" />
                         <StatTile label="Contributors" value={targetRepo.growth.contributor_count} color="text-pink-500" />
                         <StatTile label="Participation" value={`${primaryRepo.community.issue_participation}%`} />
                         <StatTile label="Participation" value={`${targetRepo.community.issue_participation}%`} />
                      </div>
                   </div>
                </div>

                {/* 5. TECH DEBT */}
                <SectionHeader icon={<BarChart3 size={22} />} title="Sustainability & Debt" desc="Maintenance risks and unresolved overhead." />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-8">
                         <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Maintenance Heatmap</h4>
                         <div className="flex gap-2"><div className="w-2 h-2 bg-white/10 rounded-full" /><div className="w-2 h-2 bg-red-500/30 rounded-full" /><div className="w-2 h-2 bg-red-500 rounded-full" /></div>
                      </div>
                      <div className="h-[120px] flex items-end gap-1 px-2">
                        {Array.from({ length: 50 }).map((_, i) => (
                          <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${Math.random() * 80 + 20}%`, backgroundColor: i % 7 === 0 ? '#ef4444' : 'rgba(255,255,255,0.05)' }} />
                        ))}
                      </div>
                   </div>
                   <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] p-10 flex flex-col justify-center text-center">
                      <Trophy className="mx-auto text-indigo-400 mb-6" size={40} />
                      <p className="text-[10px] font-black text-indigo-400/60 uppercase tracking-[0.4em] mb-4">Sustainability Winner</p>
                      <h4 className="text-4xl font-black text-white italic tracking-tighter uppercase">
                        {primaryRepo.debt.score < targetRepo.debt.score ? primaryRepo.repo.name : targetRepo.repo.name}
                      </h4>
                      <p className="text-[10px] font-bold text-gray-500 mt-6 uppercase tracking-widest">Lower Technical Debt Profile</p>
                   </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
  );
};



const RepoBattleCard = ({ data, side = "left", loading = false, title }) => (
  <div className="space-y-6 flex-1">
    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2">{title}</h3>
    <div className={`bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 flex items-center gap-10 shadow-2xl relative overflow-hidden min-h-[180px] ${loading ? 'animate-pulse' : ''}`}>
      <div className={`absolute top-0 ${side === 'left' ? 'left-0' : 'right-0'} w-32 h-full bg-gradient-to-r ${side === 'left' ? 'from-indigo-500/5 to-transparent' : 'from-transparent to-pink-500/5'}`} />
      {!loading && (
        <>
          <img src={data.repo.avatar} className="w-24 h-24 rounded-3xl border border-white/10 shadow-2xl relative z-10" />
          <div className="flex-1 relative z-10">
            <h4 className="text-3xl font-black tracking-tighter text-white italic truncate uppercase">{data.repo.name}</h4>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">{data.repo.owner}</p>
            <div className="flex gap-10">
               <div className="flex flex-col"><span className="text-[8px] font-black text-gray-600 uppercase mb-1">STARS</span><span className="text-lg font-black text-white">{Intl.NumberFormat('en', { notation: 'compact' }).format(data.repo.stars)}</span></div>
               <div className="flex flex-col"><span className="text-[8px] font-black text-gray-600 uppercase mb-1">FORKS</span><span className="text-lg font-black text-gray-400">{Intl.NumberFormat('en', { notation: 'compact' }).format(data.repo.forks)}</span></div>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
);

const SectionHeader = ({ icon, title, desc }) => (
  <div className="flex items-center gap-6 mb-10">
     <div className="w-14 h-14 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center text-indigo-400 shadow-xl">
        {icon}
     </div>
     <div>
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{title}</h3>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">{desc}</p>
     </div>
  </div>
);

const ComparisonStat = ({ label, valA, valB, unit }) => (
  <div className="bg-white/[0.01] border border-white/5 p-8 rounded-[2rem] space-y-4">
     <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{label}</p>
     <div className="flex justify-between items-end">
        <div className="flex flex-col"><span className="text-3xl font-black text-indigo-500 italic">{valA}</span><span className="text-[8px] font-black text-gray-600 uppercase">{unit}</span></div>
        <div className="h-8 w-px bg-white/5" />
        <div className="flex flex-col items-end"><span className="text-3xl font-black text-pink-500 italic">{valB}</span><span className="text-[8px] font-black text-gray-600 uppercase">{unit}</span></div>
     </div>
  </div>
);

const MiniBattleStat = ({ label, valA, valB, invert = false }) => (
  <div className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl text-center space-y-3">
     <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{label}</p>
     <div className="flex items-center justify-center gap-4">
        <span className={`text-xl font-black ${!invert ? 'text-indigo-400' : 'text-gray-500'}`}>{valA}</span>
        <span className="text-gray-800 text-[10px]">VS</span>
        <span className={`text-xl font-black ${invert ? 'text-pink-500' : 'text-gray-500'}`}>{valB}</span>
     </div>
  </div>
);

const CircularScore = ({ score, label, color }) => (
  <div className="flex flex-col items-center gap-4">
     <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="42" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="4" /><circle cx="48" cy="48" r="42" fill="transparent" stroke={color} strokeWidth="4" strokeDasharray={264} strokeDashoffset={264 - (264 * score / 100)} strokeLinecap="round" className="transition-all duration-1000" /></svg>
        <span className="absolute text-xl font-black italic" style={{ color }}>{score}%</span>
     </div>
     <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{label}</span>
  </div>
);

const VersusBar = ({ label, valA, valB }) => (
  <div className="space-y-4">
     <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
        <span>{label}</span>
        <span className="text-white italic">{valA} <span className="text-gray-700 mx-1">/</span> {valB}</span>
     </div>
     <div className="h-2.5 bg-white/5 rounded-full overflow-hidden flex shadow-inner">
        <motion.div initial={{ width: 0 }} animate={{ width: `${(valA / (valA + valB || 1)) * 100}%` }} className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
        <motion.div initial={{ width: 0 }} animate={{ width: `${(valB / (valA + valB || 1)) * 100}%` }} className="h-full bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
     </div>
  </div>
);

const StatTile = ({ label, value, color = "text-white", highlight = false }) => (
  <div className={`p-8 rounded-[2rem] border flex flex-col justify-center ${highlight ? 'bg-pink-500/5 border-pink-500/10' : 'bg-white/[0.01] border-white/5'}`}>
     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
     <p className={`text-3xl font-black italic ${color}`}>{value}</p>
  </div>
);

export default Benchmark;
