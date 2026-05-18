import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Sparkles, Stethoscope, Gauge,
  Network, Share2, Layers, Cpu, User, Target,
  History, TerminalSquare, ShieldAlert, AlertTriangle, 
  CheckCircle2, Send, X, TrendingUp, Github, 
  ExternalLink, Trophy, Code2, Rocket, Briefcase, Zap,
  Link2, Loader2, Activity
} from "lucide-react";
import { getContributorIntelligence, getContributorPortfolio } from "../services/api.js";

const ContributorAnalysis = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedContributor, setSelectedContributor] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [repoUrl, setRepoUrl] = useState(owner && repo ? `https://github.com/${owner}/${repo}` : "");

  useEffect(() => {
    if (owner && repo) {
      setRepoUrl(`https://github.com/${owner}/${repo}`);
      fetchIntelligence(owner, repo);
    }
  }, [owner, repo]);

  const handleAnalyze = () => {
    if (!repoUrl.trim()) return;
    const cleanUrl = repoUrl.trim().replace(/^(http|https):\/\//, "").replace(/\/$/, "").replace(/\.git$/, "");
    const segments = cleanUrl.split("/");
    let newOwner, newRepo;

    if (segments[0].includes("github.com") && segments.length >= 3) {
      [newOwner, newRepo] = [segments[1], segments[2]];
    } else if (segments.length === 2) {
      [newOwner, newRepo] = segments;
    } else {
      return;
    }
    
    navigate(`/contributor-analysis?owner=${newOwner}&repo=${newRepo}`);
  };

  const fetchIntelligence = async (fetchOwner, fetchRepo) => {
    setIsScanning(true);
    setError("");
    try {
      const result = await getContributorIntelligence(fetchOwner, fetchRepo);
      setData(result);
      if (result?.contributors?.length > 0) {
        handleSelectContributor(result.contributors[0]);
      } else {
        setSelectedContributor(null);
        setError("No contributors found for this repository.");
      }
      setTimeout(() => setIsScanning(false), 1500);
    } catch (err) {
      console.error("Intelligence Fetch Error:", err);
      setError(err.response?.data?.message || "Neural Link Fault: Target unreachable.");
      setData(null);
      setSelectedContributor(null);
      setTimeout(() => setIsScanning(false), 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContributor = async (contributor) => {
    setSelectedContributor(contributor);
    setLoadingPortfolio(true);
    try {
      const projects = await getContributorPortfolio(contributor.id);
      setPortfolio(projects || []);
    } catch (err) {
      setPortfolio([]);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  if (isScanning) return (
    <div className="fixed inset-0 bg-[#010409] z-[100] flex flex-col items-center justify-center p-8 font-mono overflow-hidden">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(147,51,234,0.05),_transparent)]" />
       <div className="w-full max-w-2xl space-y-8 relative">
          <div className="flex items-center gap-6 mb-12">
             <div className="w-16 h-1 bg-purple-600 rounded-full animate-pulse shadow-[0_0_20px_#a855f7]" />
             <h2 className="text-sm font-black text-white uppercase tracking-[0.6em] italic">Acquiring Talent Intelligence: {repo || 'PENDING'}</h2>
          </div>
          
          <div className="space-y-4">
             <div className="flex justify-between text-[10px] font-black text-purple-400 uppercase tracking-widest italic">
                <span>Mapping Identities</span>
                <span>88%</span>
             </div>
             <div className="h-1 bg-white/5 w-full rounded-full overflow-hidden border border-white/5">
                <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: 1.5, ease: 'easeInOut' }} className="w-full h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl animate-pulse">
                <div className="w-8 h-8 bg-purple-600/20 rounded-xl mb-4" />
                <div className="h-2 bg-white/5 w-2/3 rounded-full" />
             </div>
             <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl animate-pulse delay-75">
                <div className="w-8 h-8 bg-indigo-600/20 rounded-xl mb-4" />
                <div className="h-2 bg-white/5 w-1/2 rounded-full" />
             </div>
          </div>
       </div>
    </div>
  );

  return (
      <main className="flex-1 flex overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(147,51,234,0.03),_transparent)] pointer-events-none" />
        
        {/* LEFT: CONTRIBUTOR DIRECTORY */}
        <div className="w-[320px] border-r border-white/5 flex flex-col bg-[#010409]/40 backdrop-blur-3xl shrink-0 z-10">
           <header className="p-8 border-b border-white/5">
              <h1 className="text-xs font-black uppercase tracking-[0.4em] text-white mb-2 italic">Intelligence Directory</h1>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest italic">{data?.contributors?.length || 0} Identified Specialists</p>
           </header>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {data?.contributors?.map((c) => (
                <ContributorCard 
                  key={c.id} 
                  contributor={c} 
                  active={selectedContributor?.id === c.id} 
                  onClick={() => handleSelectContributor(c)}
                />
              ))}
           </div>
        </div>

        {/* CENTER: CONTRIBUTOR SPOTLIGHT */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
           
           {/* TARGET ACQUISITION BAR */}
           <div className="p-8 pb-0 shrink-0 z-20">
              <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-3xl shadow-xl p-6 transition-all duration-500">
                 <div className="flex items-center gap-2.5 mb-5 px-1">
                    <Zap className="text-purple-500 animate-pulse" size={16} />
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
                          placeholder="Paste repository link..."
                          className="w-full bg-[#020617] border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all text-white font-bold placeholder:text-gray-600"
                       />
                    </div>
                    <button
                       onClick={handleAnalyze}
                       className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] flex items-center justify-center gap-3 min-w-[180px]"
                    >
                       {isScanning ? <Loader2 className="animate-spin" size={18} /> : <Activity size={18} />}
                       {isScanning ? "Acquiring..." : "Analyze Target"}
                    </button>
                 </div>
              </div>
           </div>

           <div className="flex-1 flex flex-col overflow-hidden relative">
              <AnimatePresence mode="wait">
                 {selectedContributor ? (
                <motion.div 
                  key={selectedContributor.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-12"
                >
                   {/* PROFILE HEADER */}
                   <section className="flex items-start gap-12 mb-16">
                      <div className="relative shrink-0">
                         <div className="w-48 h-48 rounded-[3rem] overflow-hidden border-2 border-purple-500/30 p-2 bg-[#020617]">
                            <img src={selectedContributor.avatar} className="w-full h-full object-cover rounded-[2.5rem]" alt="" />
                         </div>
                         <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_#a855f7]">
                            <div className="text-center">
                               <div className="text-lg font-black italic">{selectedContributor.influence}</div>
                               <div className="text-[7px] font-black uppercase tracking-tighter -mt-1">Rank</div>
                            </div>
                         </div>
                      </div>
                      
                      <div className="pt-4 space-y-6 flex-1">
                         <div>
                            <div className="flex items-center gap-3 mb-2">
                               <div className="h-px w-8 bg-purple-500" />
                               <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] italic">{selectedContributor.role}</span>
                            </div>
                            <h2 className="text-6xl font-black italic text-white uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">{selectedContributor.name}</h2>
                         </div>
                         
                         <div className="flex gap-4">
                            <StatBox label="Contributions" value={selectedContributor.contributions} icon={<Cpu size={14} />} />
                            <StatBox label="Specialization" value={selectedContributor.specialization} icon={<Target size={14} />} />
                            <StatBox label="Persona" value={selectedContributor.personality} icon={<Zap size={14} />} color="text-yellow-400" />
                         </div>
                      </div>
                   </section>

                   {/* TERRITORY & JOURNEY */}
                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-16">
                      <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 space-y-8 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Briefcase size={80} className="text-purple-400" />
                         </div>
                         <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                            <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center text-purple-400">
                               <Layers size={20} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] italic text-white">Engineering Territory</h3>
                         </div>
                         <div className="space-y-4">
                            {selectedContributor.territory?.map((t, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
                                 <span className="text-xs font-black italic text-gray-300 uppercase tracking-widest">{t}</span>
                                 <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
                              </div>
                            ))}
                         </div>
                      </section>

                      <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 space-y-8 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Rocket size={80} className="text-indigo-400" />
                         </div>
                         <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                            <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400">
                               <History size={20} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] italic text-white">Milestone Journey</h3>
                         </div>
                         <div className="space-y-8 relative pl-6 border-l border-white/5">
                            <Milestone label="Neural System Core" date="14 Days Ago" desc="Architected the main neural handshake layer." active />
                            <Milestone label="Performance Warp" date="1 Month Ago" desc="Optimized tree traversal by 400%." />
                            <Milestone label="Initial Synchrony" date="2 Months Ago" desc="First contribution to the repository ecosystem." />
                         </div>
                      </section>
                   </div>

                   {/* PORTFOLIO REEL */}
                   <section className="space-y-8">
                      <div className="flex items-center justify-between px-2">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-pink-600/10 rounded-xl flex items-center justify-center text-pink-400">
                               <Github size={20} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] italic text-white">External Portfolio</h3>
                         </div>
                         <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Live from GitHub API</span>
                      </div>
                      
                      <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar-horizontal scroll-smooth h-[220px]">
                         {loadingPortfolio ? (
                           Array.from({ length: 3 }).map((_, i) => (
                             <div key={i} className="min-w-[340px] bg-white/[0.01] border border-white/5 rounded-[2.5rem] animate-pulse" />
                           ))
                         ) : (
                           portfolio.map((project, i) => (
                             <ProjectCard key={i} project={project} />
                           ))
                         )}
                      </div>
                   </section>
                 </motion.div>
                 ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-center p-8 opacity-50">
                       <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                          {error ? <ShieldAlert size={40} className="text-pink-500" /> : <Users size={40} className="text-gray-500" />}
                       </div>
                       <h3 className="text-xl font-black text-white uppercase tracking-widest italic mb-2">
                         {error ? "Analysis Terminated" : "No Target Selected"}
                       </h3>
                       <p className="text-xs text-gray-500 uppercase tracking-widest">
                         {error ? "Target could not be analyzed." : "Provide a valid repository to begin contributor neural analysis."}
                       </p>
                    </div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </main>
  );
};



const ContributorCard = ({ contributor, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left p-4 rounded-3xl transition-all border flex items-center gap-4 group ${active ? 'bg-white/5 border-purple-500/30 shadow-[0_20px_40px_rgba(0,0,0,0.4)]' : 'bg-transparent border-transparent hover:bg-white/[0.02]'}`}
  >
    <div className="relative">
       <img src={contributor.avatar} className="w-12 h-12 rounded-2xl object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
       {active && <div className="absolute inset-0 border border-purple-500 rounded-2xl animate-ping opacity-20" />}
    </div>
    <div className="flex-1 overflow-hidden">
       <h4 className={`text-xs font-black uppercase tracking-widest truncate ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{contributor.name}</h4>
       <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter truncate">{contributor.role}</p>
    </div>
    {active && <ArrowRight size={14} className="text-purple-400" />}
  </button>
);

const StatBox = ({ label, value, icon, color = "text-purple-400" }) => (
  <div className="bg-white/[0.02] border border-white/5 px-6 py-4 rounded-2xl flex items-center gap-4">
     <div className={`p-2 bg-white/[0.02] rounded-lg ${color}`}>{icon}</div>
     <div>
        <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5 italic">{label}</div>
        <div className="text-xs font-black italic text-white uppercase tracking-tight">{value}</div>
     </div>
  </div>
);

const Milestone = ({ label, date, desc, active = false }) => (
  <div className="relative space-y-1">
     <div className={`absolute -left-[31px] top-1.5 w-2 h-2 rounded-full z-10 ${active ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]' : 'bg-white/10'}`} />
     <div className="flex items-center justify-between">
        <h4 className={`text-xs font-black uppercase tracking-widest italic ${active ? 'text-white' : 'text-gray-400'}`}>{label}</h4>
        <span className="text-[9px] font-bold text-gray-500">{date}</span>
     </div>
     <p className="text-[10px] text-gray-500 italic">{desc}</p>
  </div>
);

const ProjectCard = ({ project }) => (
  <motion.a 
    href={project.url}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ y: -5 }}
    className="min-w-[340px] bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between hover:bg-white/[0.04] transition-all group"
  >
     <div className="space-y-4">
        <div className="flex justify-between items-start">
           <div className="p-3 bg-purple-600/10 rounded-2xl text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Code2 size={20} />
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase italic">
              <Trophy size={12} className="text-yellow-500" />
              {project.stars} Stars
           </div>
        </div>
        <div>
           <h4 className="text-lg font-black italic text-white uppercase tracking-tighter mb-2 group-hover:text-purple-400 transition-colors">{project.name}</h4>
           <p className="text-xs text-gray-500 leading-relaxed italic line-clamp-2">{project.description || "Experimental engineering system developed for repository scaling."}</p>
        </div>
     </div>
     
     <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest italic">{project.language || "Unknown Language"}</span>
        <ExternalLink size={14} className="text-gray-600 group-hover:text-white transition-colors" />
     </div>
  </motion.a>
);

const ArrowRight = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

export default ContributorAnalysis;
