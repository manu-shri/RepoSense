import { useNavigate, useLocation, useSearchParams, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Stethoscope, Gauge, Layers } from "lucide-react";

const SidebarItem = ({ icon, label, active = false, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-4 px-4 py-4 rounded-xl text-[10px] font-black tracking-widest transition-all w-full text-left ${active ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
    <span className={active ? 'text-indigo-400' : 'text-gray-600'}>{icon}</span>
    <span className="hidden lg:block uppercase">{label}</span>
  </button>
);

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Extract persistent context for navigation
  const owner = searchParams.get("owner") || "manu-shri";
  const repo = searchParams.get("repo") || "RepoSense";

  const handleNavigate = (path) => {
    navigate(`${path}?owner=${owner}&repo=${repo}`);
  };

  return (
    <div className="flex h-screen bg-[#020617] text-[#e6edf3] font-sans overflow-hidden">
      {/* GLOBAL SIDEBAR */}
      <aside className="w-[80px] lg:w-[280px] bg-[#020617] border-r border-white/5 flex flex-col shrink-0 z-50">
        <div className="p-8 flex items-center gap-4 border-b border-white/5">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            <Layers size={20} />
          </div>
          <div className="hidden lg:block">
            <h2 className="text-sm font-black text-white uppercase tracking-tighter italic">REPOSENSE</h2>
            <p className="text-[10px] font-bold text-indigo-400/50 tracking-widest uppercase italic">Neural Engine</p>
          </div>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <SidebarItem 
            icon={<LayoutDashboard size={18} />} 
            label="Overview" 
            active={location.pathname === "/home"}
            onClick={() => handleNavigate("/home")} 
          />
          <SidebarItem 
            icon={<Stethoscope size={18} />} 
            label="Health Terminal" 
            active={location.pathname === "/code-health"}
            onClick={() => handleNavigate("/code-health")} 
          />
          <SidebarItem 
            icon={<Users size={18} />} 
            label="Talent Showcase" 
            active={location.pathname === "/contributor-analysis"}
            onClick={() => handleNavigate("/contributor-analysis")} 
          />
          <SidebarItem 
            icon={<Gauge size={18} />} 
            label="Benchmark Engine" 
            active={location.pathname === "/benchmark"}
            onClick={() => handleNavigate("/benchmark")} 
          />
        </nav>
      </aside>

      {/* DYNAMIC MODULE CONTENT */}
      <Outlet />
    </div>
  );
};

export default Layout;
