import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  GitBranch,
  Users,
  Activity,
  Clock,
  TrendingUp,
  Code,
  ExternalLink,
  LogOut,
  GitPullRequest,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Zap,
  Shield,
  Target,
} from "lucide-react";
import { getGithubDashboard } from "../services/api.js";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentRepos, setRecentRepos] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRepos: 0,
    totalStars: 0,
    totalForks: 0,
    totalContributors: 0,
    avgCommitFreq: 0,
    activeProjects: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(stored));
    
    // Load recent repositories from localStorage
    const recent = JSON.parse(localStorage.getItem("recentRepos") || "[]");
    setRecentRepos(recent);
    
    // Calculate metrics
    calculateMetrics(recent);
  }, [navigate]);

  const calculateMetrics = (repos) => {
    const totalStars = repos.reduce((sum, repo) => sum + (repo.stars || 0), 0);
    const totalForks = repos.reduce((sum, repo) => sum + (repo.forks || 0), 0);
    const totalContributors = repos.reduce((sum, repo) => sum + (repo.contributors || 0), 0);
    const avgCommitFreq = repos.length > 0 ? Math.round(repos.reduce((sum, repo) => sum + (repo.commitFreq || 0), 0) / repos.length) : 0;
    const activeProjects = repos.filter(repo => repo.status === 'active').length;

    setMetrics({
      totalRepos: repos.length,
      totalStars,
      totalForks,
      totalContributors,
      avgCommitFreq,
      activeProjects,
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      // Extract owner and repo from GitHub URL or from "owner/repo" format
      let owner, repo;
      if (searchQuery.includes('github.com')) {
        const match = searchQuery.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
        if (match) {
          owner = match[1];
          repo = match[2];
        }
      } else {
        const parts = searchQuery.split('/');
        if (parts.length === 2) {
          owner = parts[0];
          repo = parts[1];
        }
      }

      if (!owner || !repo) {
        throw new Error('Invalid repository format. Use "owner/repo" or GitHub URL');
      }

      // Fetch repository data
      const data = await getGithubDashboard(owner, repo);
      
      // Add to recent repositories
      const newRepo = {
        id: `${owner}/${repo}`,
        name: repo,
        fullName: `${owner}/${repo}`,
        description: data.repo?.description || 'No description available',
        stars: data.repo?.stargazers_count || 0,
        forks: data.repo?.forks_count || 0,
        language: data.repo?.language || 'Unknown',
        contributors: data.community_metrics?.total_contributors || 0,
        commitFreq: data.activity_metrics?.activity_status === 'active' ? 10 : 5,
        status: data.activity_metrics?.activity_status || 'inactive',
        lastUpdated: data.repo?.updated_at || new Date().toISOString(),
        url: data.repo?.html_url || `https://github.com/${owner}/${repo}`,
      };

      const updatedRepos = [newRepo, ...recentRepos.filter(r => r.id !== newRepo.id)].slice(0, 6);
      setRecentRepos(updatedRepos);
      localStorage.setItem("recentRepos", JSON.stringify(updatedRepos));
      calculateMetrics(updatedRepos);

      // Navigate to dashboard with this repo
      navigate(`/dashboard?owner=${owner}&repo=${repo}`);
      
    } catch (error) {
      console.error('Search error:', error);
      alert(error.message || 'Failed to fetch repository data');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} className="status-active" />;
      case 'moderate':
        return <Clock size={16} className="status-moderate" />;
      default:
        return <AlertCircle size={16} className="status-inactive" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'moderate':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  if (!user) return null;

  return (
    <div className="home-wrapper">
      {/* Header */}
      <header className="home-header">
        <div className="home-brand">
          <div className="home-logo">
            <Zap size={24} />
          </div>
          <div className="home-brand-text">
            <h1>GitPulse AI</h1>
            <span>Engineering Intelligence Platform</span>
          </div>
        </div>
        
        <div className="home-user">
          <div className="user-info">
            <span className="user-name">{user.username}</span>
            <span className="user-email">{user.email}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="home-main">
        {/* Search Section */}
        <section className="search-section">
          <div className="search-container">
            <h2>Analyze any repository</h2>
            <p>Get comprehensive insights about code quality, activity patterns, and community health</p>
            
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Enter repository URL (e.g., facebook/react)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <button type="submit" className="search-btn" disabled={searchLoading}>
                {searchLoading ? (
                  <div className="search-spinner"></div>
                ) : (
                  'Analyze Repository'
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Metrics Overview */}
        <section className="metrics-section">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">
                <Code size={24} />
              </div>
              <div className="metric-content">
                <div className="metric-value">{metrics.totalRepos}</div>
                <div className="metric-label">Total Repositories</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Star size={24} />
              </div>
              <div className="metric-content">
                <div className="metric-value">{metrics.totalStars.toLocaleString()}</div>
                <div className="metric-label">Total Stars</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <GitBranch size={24} />
              </div>
              <div className="metric-content">
                <div className="metric-value">{metrics.totalForks.toLocaleString()}</div>
                <div className="metric-label">Total Forks</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Users size={24} />
              </div>
              <div className="metric-content">
                <div className="metric-value">{metrics.totalContributors}</div>
                <div className="metric-label">Contributors</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Activity size={24} />
              </div>
              <div className="metric-content">
                <div className="metric-value">{metrics.avgCommitFreq}</div>
                <div className="metric-label">Avg. Weekly Commits</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <TrendingUp size={24} />
              </div>
              <div className="metric-content">
                <div className="metric-value">{metrics.activeProjects}</div>
                <div className="metric-label">Active Projects</div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Repositories */}
        <section className="recent-section">
          <div className="section-header">
            <h3>Recent Repositories</h3>
            <button className="view-all-btn">View All</button>
          </div>

          {recentRepos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Code size={48} />
              </div>
              <h4>No repositories analyzed yet</h4>
              <p>Start by searching for a repository above to see detailed insights</p>
            </div>
          ) : (
            <div className="repos-grid">
              {recentRepos.map((repo) => (
                <div key={repo.id} className="repo-card">
                  <div className="repo-header">
                    <div className="repo-info">
                      <h4>{repo.name}</h4>
                      <span className="repo-fullname">{repo.fullName}</span>
                    </div>
                    <div className="repo-status">
                      {getStatusIcon(repo.status)}
                    </div>
                  </div>

                  <p className="repo-description">{repo.description}</p>

                  <div className="repo-stats">
                    <div className="stat">
                      <Star size={14} />
                      <span>{repo.stars.toLocaleString()}</span>
                    </div>
                    <div className="stat">
                      <GitBranch size={14} />
                      <span>{repo.forks.toLocaleString()}</span>
                    </div>
                    <div className="stat">
                      <Users size={14} />
                      <span>{repo.contributors}</span>
                    </div>
                    <div className="stat">
                      <Activity size={14} />
                      <span>{repo.commitFreq}/wk</span>
                    </div>
                  </div>

                  <div className="repo-footer">
                    <div className="repo-language">
                      <span className="language-dot" style={{ backgroundColor: getStatusColor(repo.status) }}></span>
                      {repo.language}
                    </div>
                    <a href={repo.url} target="_blank" rel="noreferrer" className="repo-link">
                      <ExternalLink size={14} />
                      View on GitHub
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h3>Platform Features</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 size={24} />
              </div>
              <h4>Advanced Analytics</h4>
              <p>Deep insights into code quality, commit patterns, and development velocity</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={24} />
              </div>
              <h4>Security Analysis</h4>
              <p>Comprehensive security scanning and vulnerability assessment</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Target size={24} />
              </div>
              <h4>Performance Metrics</h4>
              <p>Track repository performance and optimization opportunities</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <GitPullRequest size={24} />
              </div>
              <h4>PR Analysis</h4>
              <p>Analyze pull request patterns and merge efficiency</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
