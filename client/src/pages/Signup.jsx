import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Github, Terminal, AtSign, Activity } from "lucide-react";
import { signup } from "../services/api.js";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await signup(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pulse-dark text-white font-sans relative overflow-hidden flex flex-col">
      {/* Background Grid & Glows */}
      <div className="absolute inset-0 z-0 opacity-20" style={{ 
        backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', 
        backgroundSize: '24px 24px' 
      }} />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pulse-teal/10 rounded-full blur-[120px] -ml-48 -mb-48 z-0" />

      {/* Header */}
      <header className="p-8 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-pulse-teal rounded-lg flex items-center justify-center text-pulse-dark shadow-[0_0_15px_rgba(0,242,255,0.4)]">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">GitPulse AI</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[480px] bg-pulse-card/80 backdrop-blur-xl border border-white/5 rounded-[24px] p-10 md:p-14 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-pulse-teal/10 rounded-xl flex items-center justify-center text-pulse-teal mb-6 border border-pulse-teal/20">
              <User size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold mb-3 tracking-tight">Join the network</h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-[280px]">
              Start monitoring your engineering velocity
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 tracking-[0.1em] uppercase ml-1">USERNAME</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pulse-teal transition-colors" size={18} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={form.username}
                  onChange={handleChange}
                  className="w-full bg-pulse-dark/50 border border-white/5 rounded-xl py-3 px-12 text-sm focus:outline-none focus:border-pulse-teal/50 focus:ring-1 focus:ring-pulse-teal/30 transition-all placeholder:text-gray-600"
                  placeholder="octocat"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 tracking-[0.1em] uppercase ml-1">EMAIL ADDRESS</label>
              <div className="relative group">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pulse-teal transition-colors" size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-pulse-dark/50 border border-white/5 rounded-xl py-3 px-12 text-sm focus:outline-none focus:border-pulse-teal/50 focus:ring-1 focus:ring-pulse-teal/30 transition-all placeholder:text-gray-600"
                  placeholder="dev@gitpulse.ai"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 tracking-[0.1em] uppercase ml-1">PASSWORD</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pulse-teal transition-colors" size={18} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-pulse-dark/50 border border-white/5 rounded-xl py-3 px-12 text-sm focus:outline-none focus:border-pulse-teal/50 focus:ring-1 focus:ring-pulse-teal/30 transition-all placeholder:text-gray-600 font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              className="w-full py-4 bg-pulse-gradient rounded-xl text-pulse-dark font-bold text-base shadow-[0_0_20px_rgba(0,242,255,0.2)] hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] hover:scale-[1.01] transition-all mt-4 disabled:opacity-50"
              type="submit" 
              disabled={loading}
            >
              {loading ? "Creating..." : "Start Building Free"}
            </button>
          </form>

          <p className="mt-10 text-sm text-gray-500 text-center">
            Already have an account? <Link to="/login" className="text-pulse-teal font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </main>

      {/* Status Footer */}
      <footer className="p-8 flex justify-center relative z-10">
        <div className="bg-pulse-dark/50 border border-white/5 py-1.5 px-4 rounded-full text-[10px] font-bold text-gray-500 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-pulse-teal rounded-full shadow-[0_0_8px_rgba(0,242,255,0.6)]"></span>
          ENCRYPTION STATUS: <span className="text-pulse-teal">ACTIVE</span>
        </div>
      </footer>
    </div>
  );
};

export default Signup;
