import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Sparkles, Link2, Activity, Zap, Loader2,
  Cpu, GitBranch, TerminalSquare, AlertTriangle
} from "lucide-react";
import { getAiSummary } from "../services/api.js";

const AiSummary = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);

  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  const fetchSummary = async (fetchOwner, fetchRepo) => {
    setLoading(true);
    setError("");
    setSummary("");
    
    try {
      const data = await getAiSummary(fetchOwner, fetchRepo);
      if (data && data.summary) {
        setSummary(data.summary);
      } else {
        setError("Neural Engine failed to generate a comprehensive summary.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Neural Link Fault: Target unreachable or API key missing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/login"); return; }
    setUser(JSON.parse(stored));

    if (owner && repo && !ignore) {
      setRepoUrl(`https://github.com/${owner}/${repo}`);
      
      const fetchInitialSummary = async () => {
        setLoading(true);
        setError("");
        setSummary("");
        
        try {
          const data = await getAiSummary(owner, repo);
          if (!ignore) {
            if (data && data.summary) {
              setSummary(data.summary);
            } else {
              setError("Neural Engine failed to generate a comprehensive summary.");
            }
          }
        } catch (err) {
          if (!ignore) {
            console.error(err);
            setError(err.response?.data?.message || "Neural Link Fault: Target unreachable or API key missing.");
          }
        } finally {
          if (!ignore) {
            setLoading(false);
          }
        }
      };
      
      fetchInitialSummary();
    }
    
    return () => { ignore = true; };
  }, [owner, repo, navigate]);

  const handleAnalyze = () => {
    if (!repoUrl.trim()) return;
    let cleanUrl = repoUrl.trim().split('?')[0].split('#')[0];
    cleanUrl = cleanUrl.replace(/^(http|https):\/\//, "").replace(/\/$/, "").replace(/\.git$/, "");
    const segments = cleanUrl.split("/");
    let newOwner, newRepo;

    if (segments[0].includes("github.com") && segments.length >= 3) {
      [newOwner, newRepo] = [segments[1], segments[2]];
    } else if (segments.length === 2) {
      [newOwner, newRepo] = segments;
    } else {
      setError("Invalid GitHub URL format.");
      return;
    }

    if (newOwner === owner && newRepo === repo) {
      // If same repo, force re-fetch
      fetchSummary(newOwner, newRepo);
    } else {
      // Navigate to new URL
      navigate(`/ai-summary?owner=${newOwner}&repo=${newRepo}`);
    }
  };


  if (!user) return null;

  return (
    <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative bg-[radial-gradient(circle_at_50%_-20%,_rgba(139,92,246,0.05),_transparent)]">
      
      {/* HEADER */}
      <header className="h-[70px] border-b border-white/5 flex items-center justify-between px-10 shrink-0 sticky top-0 bg-[#020617]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <Sparkles className="text-purple-500" size={20} />
          <h1 className="text-sm font-black tracking-[0.3em] text-white uppercase italic">Neural Architecture Review</h1>
        </div>
      </header>

      <div className="p-10 space-y-12 max-w-[1200px] mx-auto w-full pb-32">
        
        {/* TARGET ACQUISITION */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-all" />
          
          <div className="flex items-center gap-2.5 px-1">
            <Zap className="text-purple-500 animate-pulse" size={16} />
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Neural Target Acquisition</h3>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 relative z-10">
            <div className="flex-1 relative">
              <Link2 className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Paste target repo URL..."
                className="w-full bg-[#020617] border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-sm focus:outline-none focus:border-purple-500/50 transition-all text-white font-bold placeholder:text-gray-700"
              />
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-5 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-[0_0_30px_rgba(147,51,234,0.2)] flex items-center justify-center gap-4 min-w-[220px]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Activity size={18} />}
              {loading ? "Synthesizing..." : "Generate Review"}
            </button>
          </div>
          {error && <p className="text-[10px] text-pink-500 font-black uppercase tracking-widest pl-2">{error}</p>}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-8">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 border-t-2 border-purple-500 rounded-full animate-spin" />
              <div className="absolute inset-2 border-b-2 border-indigo-500 rounded-full animate-spin direction-reverse" />
              <Cpu className="text-purple-400 animate-pulse" size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] italic">Deep Scanning Repository</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Absorbing Context... 1.5M Tokens capacity engaged</p>
            </div>
          </div>
        )}

        {/* SUMMARY OUTPUT */}
        {!loading && summary && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#010409] border border-white/5 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <TerminalSquare size={120} className="text-purple-500" />
            </div>
            
            <div className="flex items-center gap-4 mb-10 pb-8 border-b border-white/5 relative z-10">
              <div className="w-12 h-12 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
                <GitBranch size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Executive Analysis</h2>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Generated by Gemini Flash Latest</p>
              </div>
              <button 
                onClick={() => {
                  const element = document.createElement("a");
                  const file = new Blob([summary], {type: 'text/markdown'});
                  element.href = URL.createObjectURL(file);
                  element.download = `${repo || 'repository'}-summary.md`;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                className="bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 rounded-xl px-6 py-3 font-bold text-[10px] tracking-widest uppercase transition-colors flex items-center gap-2"
              >
                Download .MD
              </button>
            </div>

            <div className="prose prose-invert prose-purple max-w-none relative z-10 
              prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:italic
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-p:text-gray-300 prose-p:leading-relaxed prose-p:font-medium
              prose-strong:text-purple-300 prose-strong:font-black
              prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:text-indigo-300
              prose-li:text-gray-300 prose-li:marker:text-purple-500
              prose-pre:bg-[#020617] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl
              prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md"
            >
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </motion.div>
        )}

        {!loading && !summary && !error && repo && owner && (
          <div className="flex flex-col items-center justify-center py-32 opacity-30 text-center">
             <AlertTriangle size={64} className="text-gray-500 mb-6" />
             <h3 className="text-xl font-black text-white uppercase tracking-widest italic mb-2">No Summary Available</h3>
             <p className="text-xs text-gray-500 uppercase tracking-widest">Click "Generate Review" to start the analysis.</p>
          </div>
        )}

      </div>
    </main>
  );
};

export default AiSummary;
