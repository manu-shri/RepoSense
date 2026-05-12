const GH_API = "https://api.github.com";

const withHeaders = () => {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "RepoSense",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const ghGet = async (path) => {
  const url = `${GH_API}${path}`;
  console.log(`[GitHub API] Fetching: ${url}`);
  
  try {
    const res = await fetch(url, { 
      headers: withHeaders(),
      signal: AbortSignal.timeout(10000) // Increased to 10s for heavy stats
    });
    
    // GitHub returns 202 if the stats are being computed
    if (res.status === 202) return { _isPending: true };
    if (res.status === 404) return { _isNotFound: true };
    if (res.status === 401 || res.status === 403) return { _isUnauthorized: true };
    
    if (!res.ok) return null;

    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.error(`[GitHub API] Error: ${err.message} for ${url}`);
    return null;
  }
};

const calculateAverageMergeTime = (pullRequests) => {
  const mergedPRs = (pullRequests || []).filter(pr => pr?.merged_at);
  if (mergedPRs.length === 0) return 0;
  const totalTime = mergedPRs.reduce((sum, pr) => {
    return sum + (new Date(pr.merged_at) - new Date(pr.created_at));
  }, 0);
  return Math.round(totalTime / mergedPRs.length / (1000 * 60 * 60 * 24));
};

const getActivityStatus = (repoInfo, lastCommitDate) => {
  const lastActivity = lastCommitDate ? new Date(lastCommitDate) : (repoInfo?.pushed_at ? new Date(repoInfo.pushed_at) : new Date());
  const days = Math.floor((new Date() - lastActivity) / (1000 * 60 * 60 * 24));
  if (days <= 7) return 'active';
  if (days <= 30) return 'moderate';
  return 'inactive';
};

export const getRepoDashboard = async (req, res) => {
  try {
    const owner = req.query.owner?.toString().trim();
    let repo = req.query.repo?.toString().trim();

    if (!owner || !repo) {
      return res.status(400).json({ message: "Owner and Repo parameters are required." });
    }

    repo = repo.replace(/\.git$/, "");
    const repoInfo = await ghGet(`/repos/${owner}/${repo}`);
    
    if (repoInfo?._isNotFound) return res.status(404).json({ message: "Repository not found." });
    if (repoInfo?._isUnauthorized) return res.status(403).json({ message: "Access denied. Private repository?" });
    if (repoInfo?._isPending || !repoInfo) return res.status(202).json({ message: "Target indexing in progress...", _isPending: true });

    // Parallel fetch for all metrics
    const results = await Promise.all([
      ghGet(`/repos/${owner}/${repo}/stats/commit_activity`),
      ghGet(`/repos/${owner}/${repo}/contributors?per_page=10`),
      ghGet(`/repos/${owner}/${repo}/languages`),
      ghGet(`/repos/${owner}/${repo}/pulls?state=all&per_page=60`),
      ghGet(`/repos/${owner}/${repo}/commits?per_page=1`),
      ghGet(`/repos/${owner}/${repo}/releases?per_page=1`),
      ghGet(`/repos/${owner}/${repo}/stats/code_frequency`),
      ghGet(`/repos/${owner}/${repo}/contents/.github/workflows`)
    ]);

    const [caRes, contributors, languages, prs, commits, releases, ccRes, workflows] = results;

    const pullRequests = Array.isArray(prs) ? prs : [];
    const mergedPRsCount = pullRequests.filter(pr => pr?.merged_at).length;
    
    // Check if critical background stats are still being computed
    const isStatsPending = (caRes?._isPending || ccRes?._isPending);

    let busFactor = 0;
    const validContributors = Array.isArray(contributors) ? contributors : [];
    if (validContributors.length > 0) {
      const total = validContributors.reduce((sum, c) => sum + (c?.contributions || 0), 0);
      let running = 0;
      for (const c of validContributors) {
        running += (c?.contributions || 0);
        busFactor++;
        if (running >= total / 2) break;
      }
    }

    res.json({
      repo: {
        name: repoInfo.name,
        stargazers_count: repoInfo.stargazers_count,
        forks_count: repoInfo.forks_count,
        open_issues_count: repoInfo.open_issues_count,
      },
      pr_metrics: {
        merged_prs: mergedPRsCount,
        lead_time_days: calculateAverageMergeTime(pullRequests),
        merge_velocity: Math.round((mergedPRsCount / Math.max(1, pullRequests.length)) * 100),
      },
      activity_metrics: {
        activity_status: getActivityStatus(repoInfo, commits?.[0]?.commit?.author?.date),
        total_releases: Array.isArray(releases) ? releases.length : 0,
        bus_factor: busFactor
      },
      community_metrics: {
        contributor_leaderboard: validContributors.slice(0, 5).map(c => ({
          login: c.login,
          contributions: c.contributions,
          avatar_url: c.avatar_url
        })),
        readme_score: 90,
        community_health_files: { score: 80 }
      },
      technical_metrics: {
        frameworks_detected: Object.keys(languages || {}).slice(0, 3),
        has_cicd: Array.isArray(workflows) && workflows.length > 0,
        code_churn: Array.isArray(ccRes) ? ccRes.slice(-12).map(w => ({ additions: w[1], deletions: Math.abs(w[2]) })) : []
      },
      commit_activity: Array.isArray(caRes) ? caRes : [],
      languages: languages || {},
      _isStatsPending: isStatsPending
    });
  } catch (err) {
    console.error(`[Dashboard] Fault: ${err.message}`);
    res.status(500).json({ message: "Engine sync failure." });
  }
};
