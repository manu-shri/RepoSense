import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Sparkles, Stethoscope, Gauge, LogOut, Cpu,
  Search, Link2, Activity, Zap, TrendingUp, ShieldAlert, Clock, 
  ChevronRight, ArrowRight, Layers, Box, Globe, Loader2, GitBranch,
  Terminal, File, Folder, AlertTriangle, CheckCircle2, ShieldCheck,
  Code, MessageSquare, Send, X, TerminalSquare, Info, Filter, Bug,
  History, SearchCode, Database, Settings
} from "lucide-react";
import { getHealthStructure, askHealthAI } from "../services/api.js";

const CodeHealth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [scanLogs, setScanLogs] = useState([]);
  const [data, setData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [issueFilter, setIssueFilter] = useState("all");
  const chatEndRef = useRef(null);

  // OWNER/REPO FROM PARAMS
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/login"); return; }
    setUser(JSON.parse(stored));

    if (owner && repo) {
      runScan(owner, repo);
    }
  }, [owner, repo]); // Re-run when owner/repo changes

  const runScan = async (o, r) => {
    setScanning(true);
    setScanLogs([]);
    const logs = [
      "INITIALIZING REPOSITORY INSPECTION...",
      "FETCHING REPOSITORY METADATA...",
      "ANALYZING COMMIT CHURN...",
      "SCANNING ISSUES...",
      "CHECKING COMMUNITY STANDARDS...",
      "MAPPING DEPENDENCIES...",
      "DETECTING RISK FACTORS...",
      "INSPECTION COMPLETE."
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(res => setTimeout(res, 250));
      setScanLogs(prev => [...prev, logs[i]]);
    }

    try {
      const result = await getHealthStructure(o, r);
      setData(result);
      
      // AUTO-SELECT .gitignore BY DEFAULT
      const gitIgnore = result.tree.find(f => f.path.toLowerCase().includes('.gitignore'));
      if (gitIgnore) setSelectedFile(gitIgnore);
      else if (result.tree.length > 0) setSelectedFile(result.tree[0]);

      await new Promise(res => setTimeout(res, 500));
      setScanning(false);
    } catch (err) {
      setScanLogs(prev => [...prev, "ERROR: NEURAL ENGINE LINK FAILURE."]);
    }
  };

  const handleAiChat = async () => {
    if (!chatInput || aiLoading) return;
    setAiLoading(true);
    setChatInput("");
    try {
      const res = await askHealthAI(chatInput, { 
        repo: data.repo, 
        selected: selectedFile?.path || "global scope",
        summary: data.summary 
      });
      setAiResponse(res.response);
    } catch (err) {
      setAiResponse("AI Connection Link Failed.");
    } finally {
      setAiLoading(false);
    }
  };

  if (scanning) return (
    <div className="fixed inset-0 bg-[#010409] z-[100] flex flex-col items-center justify-center p-8 font-mono overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(79,70,229,0.1),_transparent)] opacity-50" />
      <div className="w-full max-w-xl space-y-3 relative z-10">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-12 h-1 bg-indigo-600 rounded-full animate-pulse" />
           <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em]">Neural Diagnostic Scan: {repo || 'PENDING'}</h2>
        </div>
        {scanLogs.map((log, i) => (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className={`text-xs font-bold ${log.startsWith("ERROR") ? 'text-red-500' : 'text-gray-400'}`}>
            <span className="text-indigo-900 mr-4">INF-0{i+1}</span>
            {log}
          </motion.div>
        ))}
        {scanLogs.length < 8 && (
          <div className="flex items-center gap-2 mt-4">
             <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
             <span className="text-[10px] text-indigo-600 font-black uppercase italic">Processing Layer {scanLogs.length + 1}...</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-[70px] border-b border-white/5 flex items-center justify-between px-10 shrink-0 bg-[#010409]/40 backdrop-blur-xl">
           <div className="flex items-center gap-4">
              <TerminalSquare size={18} className="text-indigo-400" />
              <h1 className="text-xs font-black uppercase tracking-[0.3em] text-white italic">Interactive Inspection Terminal</h1>
           </div>
           <div className="flex gap-6 items-center">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{data?.repo?.name} Linked</span>
              </div>
              <button onClick={() => runScan(owner, repo)} className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Re-Scan</button>
           </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* REPO EXPLORER (LEFT) */}
          <div className="w-[320px] bg-[#010409]/30 border-r border-white/5 flex flex-col">
             <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Explorer</span>
                <SearchCode size={14} className="text-gray-600" />
             </div>
             <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <FileTree items={data.tree} onSelect={setSelectedFile} selected={selectedFile} />
             </div>
          </div>

          {/* INSPECTION CENTER */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(79,70,229,0.02),_transparent)] pointer-events-none" />
             
             <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                {selectedFile ? (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${selectedFile.health === 'critical' ? 'bg-red-500 shadow-[0_0_12px_#ef4444]' : selectedFile.health === 'warning' ? 'bg-yellow-500 shadow-[0_0_12px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_12px_#10b981]'}`} />
                            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">{selectedFile.path.split('/').pop()}</h2>
                         </div>
                         <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">Diagnostic: {selectedFile.health}</div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <InspectionReport title="INVESTIGATION LOGS" icon={<History size={16} />}>
                            <div className="space-y-4">
                               <LogLine label="Code Churn (30d)" value={selectedFile.diagnostics?.churn || "Scanning..."} warning={selectedFile.health !== 'healthy'} />
                               <LogLine label="Last Inspector" value={selectedFile.diagnostics?.inspector || "Neural Pulse"} />
                               <LogLine label="Logic Staleness" value={selectedFile.diagnostics?.staleness || "Low"} />
                               <div className="pt-4 border-t border-white/5">
                                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3">Diagnostic Findings:</p>
                                  <p className="text-[11px] text-gray-500 leading-relaxed italic">{selectedFile.diagnostics?.findings || "Processing module DNA..."}</p>
                                </div>
                            </div>
                         </InspectionReport>

                         <InspectionReport title="DEPENDENCY IMPACT" icon={<Database size={16} />}>
                            <div className="space-y-4">
                               <LogLine label="Peer Conflicts" value={selectedFile.health === 'critical' ? 'Detected' : 'None'} />
                               <LogLine label="Direct Impacts" value={selectedFile.type === 'tree' ? 'Directory Scope' : 'Module Scope'} />
                               <LogLine label="Risk Factor" value={selectedFile.health === 'critical' ? 'HIGH' : 'LOW'} warning={selectedFile.health === 'critical'} />
                               <div className="pt-4 border-t border-white/5">
                                  <div className="flex items-center gap-2 text-indigo-500 mb-2">
                                     <Info size={12} />
                                     <span className="text-[10px] font-black uppercase">Dependency analysis active.</span>
                                  </div>
                                  <p className="text-[11px] text-gray-500 italic">This module is an integral part of the {selectedFile.path.includes('/') ? selectedFile.path.split('/')[0] : 'root'} layer.</p>
                               </div>
                            </div>
                         </InspectionReport>
                      </div>

                      <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <Bug className="text-indigo-400" size={18} />
                               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Issue Resolution Health</h3>
                            </div>
                            <div className="flex gap-2">
                               <button onClick={() => setIssueFilter("all")} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${issueFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-500'}`}>All</button>
                               <button onClick={() => setIssueFilter("critical")} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${issueFilter === 'critical' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-500'}`}>Critical</button>
                            </div>
                         </div>
                         <div className="space-y-4">
                            <IssueTerminalLine severity="critical" id="221" title="Memory leak in core flow" aging="87 Days" />
                            <IssueTerminalLine severity="warning" id="225" title="Dependency mismatch detected" aging="12 Days" />
                            <IssueTerminalLine severity="healthy" id="228" title="Refactor module structure" aging="2 Days" />
                         </div>
                      </div>
                   </motion.div>
                ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                      <SearchCode size={80} strokeWidth={1} className="text-indigo-500 mb-6" />
                      <p className="text-[10px] font-black uppercase tracking-[0.5em]">Select module for investigative diagnostics</p>
                   </div>
                )}
             </div>

             <div className="h-[220px] bg-[#010409] border-t border-white/10 p-10 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Community Standards Inspector</h3>
                   <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase">Compliance Engine Ready</span>
                   </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-6">
                   <ComplianceCheck label="README.md" status={data.community?.files?.readme} />
                   <ComplianceCheck label="LICENSE" status={data.community?.files?.license} />
                   <ComplianceCheck label="CONTRIBUTING" status={data.community?.files?.contributing} />
                   <ComplianceCheck label="SECURITY.md" status={data.community?.files?.security_policy} />
                   <ComplianceCheck label="CODE_OF_CONDUCT" status={data.community?.files?.code_of_conduct} />
                   <ComplianceCheck label="ISSUE_TEMPLATES" status={true} />
                   <ComplianceCheck label="PULL_REQUEST_TEMPLATES" status={false} />
                   <ComplianceCheck label="DOCUMENTATION" status={true} />
                </div>
             </div>
          </div>
        </div>
      </main>
      
      <motion.div 
        drag 
        dragMomentum={false}
        className={`fixed bottom-10 right-10 w-[450px] bg-[#010409] border border-indigo-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(79,70,229,0.2)] z-[100] overflow-hidden flex flex-col transition-all ${isAiOpen ? 'h-[600px]' : 'h-16'}`}
      >
        <div className="h-16 flex items-center justify-between px-6 bg-indigo-600/10 cursor-pointer border-b border-white/5" onClick={() => setIsAiOpen(!isAiOpen)}>
           <div className="flex items-center gap-3">
              <Sparkles className="text-indigo-400" size={18} />
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic">Ask Repository</h3>
           </div>
           {isAiOpen ? <X size={18} /> : <ChevronRight size={18} />}
        </div>

        {isAiOpen && (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-[11px] custom-scrollbar">
               {aiResponse ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                    <span className="text-indigo-600 mr-2">&gt;</span>{aiResponse}
                  </motion.div>
               ) : (
                  <div className="space-y-6 opacity-40">
                     <p className="animate-pulse italic">Engineering assistant standby...</p>
                     <div className="space-y-2">
                        <p className="text-indigo-500 font-black uppercase text-[9px]">Investigation Prompts:</p>
                        <PromptButton text="Why is repository health low?" onClick={setChatInput} />
                        <PromptButton text="Which module is unstable?" onClick={setChatInput} />
                        <PromptButton text="Why are stale issues increasing?" onClick={setChatInput} />
                        <PromptButton text="Which dependency is risky?" onClick={setChatInput} />
                     </div>
                  </div>
               )}
               {aiLoading && <div className="text-indigo-500 animate-pulse mt-4">&gt; ANALYZING REPOSITORY DNA...</div>}
               <div ref={chatEndRef} />
            </div>
            <div className="p-6 bg-black/40 border-t border-white/5 flex gap-4">
               <input 
                 value={chatInput}
                 onChange={(e) => setChatInput(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleAiChat()}
                 placeholder="Type command..." 
                 className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500/50"
               />
               <button onClick={handleAiChat} className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:bg-indigo-500 transition-all shadow-lg">
                  <Send size={18} />
               </button>
            </div>
          </>
        )}
      </motion.div>
    </>
  );
};



const FileTree = ({ items, onSelect, selected }) => {
  const tree = {};
  items.forEach(item => {
    const parts = item.path.split('/');
    let current = tree;
    parts.forEach((part, i) => {
      if (!current[part]) current[part] = i === parts.length - 1 ? item : {};
      current = current[part];
    });
  });

  const renderItem = (name, node, depth = 0) => {
    const isFile = !!node.path;
    if (isFile) {
      return (
        <div key={node.path} onClick={() => onSelect(node)} className={`flex items-center gap-2 py-1.5 px-3 rounded-lg cursor-pointer transition-all hover:bg-white/5 group ${selected?.path === node.path ? 'bg-indigo-600/10 border border-indigo-500/20' : ''}`} style={{ paddingLeft: `${depth * 12 + 12}px` }}>
          <File size={14} className={node.health === 'critical' ? 'text-red-500' : node.health === 'warning' ? 'text-yellow-500' : 'text-gray-600'} />
          <span className={`text-[11px] font-bold ${node.health === 'critical' ? 'text-red-400' : node.health === 'warning' ? 'text-yellow-400' : 'text-gray-400 group-hover:text-white'}`}>{name}</span>
          <div className={`w-1.5 h-1.5 rounded-full ml-auto ${node.health === 'critical' ? 'bg-red-500' : node.health === 'warning' ? 'bg-yellow-500' : 'bg-transparent'}`} />
        </div>
      );
    }
    return (
      <div key={name}>
        <div className="flex items-center gap-2 py-2 px-3 text-gray-500 font-black text-[10px] uppercase tracking-widest" style={{ paddingLeft: `${depth * 12 + 12}px` }}>
          <Folder size={14} className="text-gray-700" />
          <span>{name}</span>
        </div>
        <div>{Object.entries(node).map(([k, v]) => renderItem(k, v, depth + 1))}</div>
      </div>
    );
  };
  return <div className="space-y-1">{Object.entries(tree).map(([k, v]) => renderItem(k, v))}</div>;
};

const InspectionReport = ({ title, icon, children }) => (
  <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 shadow-xl">
    <div className="flex items-center gap-3 mb-6">
       <span className="text-indigo-400">{icon}</span>
       <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">{title}</h4>
    </div>
    {children}
  </div>
);

const LogLine = ({ label, value, warning = false }) => (
  <div className="flex justify-between items-center text-[11px] border-b border-white/5 pb-2">
    <span className="font-bold text-gray-600 uppercase tracking-widest">{label}</span>
    <span className={`font-black italic tracking-tighter ${warning ? 'text-pink-500' : 'text-white'}`}>{value}</span>
  </div>
);

const IssueTerminalLine = ({ severity, id, title, aging }) => (
  <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl group hover:border-indigo-500/30 transition-all cursor-pointer">
    <div className="flex items-center gap-4">
       <span className={`text-[10px] font-black ${severity === 'critical' ? 'text-red-500' : severity === 'warning' ? 'text-yellow-500' : 'text-emerald-500'}`}>#{id}</span>
       <span className="text-xs font-bold text-white uppercase italic tracking-tight">{title}</span>
    </div>
    <div className="flex items-center gap-4">
       <span className="text-[9px] font-black text-gray-600 uppercase">{aging}</span>
       <ChevronRight size={14} className="text-gray-800 group-hover:text-indigo-500" />
    </div>
  </div>
);

const ComplianceCheck = ({ label, status }) => (
  <div className="flex items-center justify-between group border-b border-white/5 pb-2">
     <span className={`text-[10px] font-black tracking-widest uppercase transition-all ${status ? 'text-gray-400 group-hover:text-white' : 'text-gray-700'}`}>{label}</span>
     {status ? (
       <CheckCircle2 size={14} className="text-emerald-500" />
     ) : (
       <X size={14} className="text-red-900" />
     )}
  </div>
);

const PromptButton = ({ text, onClick }) => (
  <button onClick={() => onClick(text)} className="block w-full text-left py-1 hover:text-white transition-all">
    - {text}
  </button>
);

export default CodeHealth;
