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

const ghGet = async (path, timeout = 8000) => {
  const url = `${GH_API}${path}`;
  try {
    const res = await fetch(url, { 
      headers: withHeaders(),
      signal: AbortSignal.timeout(timeout)
    });
    
    if (res.status === 202) return { _isPending: true };
    if (res.status === 404) return { _isNotFound: true };
    if (res.status === 401 || res.status === 403) return { _isUnauthorized: true };
    
    if (!res.ok) return null;

    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.warn(`[GitHub API] Skip/Timeout: ${path}`);
    return null;
  }
};

const calculateHealthGrade = (issueCount, prMergeVelocity, docScore, activity) => {
  let score = 0;
  if (prMergeVelocity > 70) score += 40;
  else if (prMergeVelocity > 40) score += 20;
  
  if (docScore > 80) score += 30;
  if (issueCount < 50) score += 20;
  if (activity === 'active') score += 10;

  if (score >= 90) return { grade: 'A+', color: '#8957e5', label: 'Exemplary' };
  if (score >= 70) return { grade: 'A', color: '#6366f1', label: 'Robust' };
  if (score >= 50) return { grade: 'B', color: '#3b82f6', label: 'Stable' };
  return { grade: 'C', color: '#64748b', label: 'Improving' };
};

export const getRepoDashboard = async (req, res) => {
  try {
    const owner = req.query.owner?.toString().trim();
    let repo = req.query.repo?.toString().trim();

    if (!owner || !repo) return res.status(400).json({ message: "Target required." });
    repo = repo.replace(/\.git$/, "");
    
    // STEP 1: Metadata
    const repoInfo = await ghGet(`/repos/${owner}/${repo}`, 5000);
    if (repoInfo?._isNotFound) return res.status(404).json({ message: "Repository not found." });
    if (repoInfo?._isUnauthorized) return res.status(403).json({ message: "Access denied." });
    if (repoInfo?._isPending || !repoInfo) return res.status(202).json({ message: "Initializing...", _isPending: true });

    // STEP 2: Parallel Deep Analysis
    const results = await Promise.all([
      ghGet(`/repos/${owner}/${repo}/stats/commit_activity`, 7000),
      ghGet(`/repos/${owner}/${repo}/contributors?per_page=10`, 5000),
      ghGet(`/repos/${owner}/${repo}/languages`, 5000),
      ghGet(`/repos/${owner}/${repo}/pulls?state=all&per_page=60`, 7000),
      ghGet(`/repos/${owner}/${repo}/commits?per_page=60`, 7000),
      ghGet(`/repos/${owner}/${repo}/stats/code_frequency`, 7000),
      ghGet(`/repos/${owner}/${repo}/actions/runs?per_page=20`, 5000),
      ghGet(`/repos/${owner}/${repo}/community/profile`, 5000),
      ghGet(`/repos/${owner}/${repo}/issues?state=all&per_page=60`, 7000),
      ghGet(`/repos/${owner}/${repo}/releases/latest`, 3000)
    ]);

    const [caRes, contributors, languages, prs, commits, ccRes, actions, community, issues, latestRelease] = results;

    // Calculations
    const pullRequests = Array.isArray(prs) ? prs : [];
    const mergedPRs = pullRequests.filter(pr => pr?.merged_at);
    const mergeVelocity = Math.round((mergedPRs.length / Math.max(1, pullRequests.length)) * 100);
    
    const validIssues = Array.isArray(issues) ? issues.filter(i => !i.pull_request) : [];
    const staleIssues = validIssues.filter(i => i.state === 'open' && (new Date() - new Date(i.updated_at)) > 30 * 24 * 60 * 60 * 1000);
    
    const resolutionRate = Math.round((validIssues.filter(i => i.state === 'closed').length / Math.max(1, validIssues.length)) * 100);

    const docScore = community?.health_percentage || 0;
    const health = calculateHealthGrade(validIssues.length, mergeVelocity, docScore, 'active');

    // Peak Coding Hours Calculation
    const hourlyDistribution = new Array(24).fill(0);
    (Array.isArray(commits) ? commits : []).forEach(c => {
      const hour = new Date(c.commit?.author?.date).getHours();
      hourlyDistribution[hour]++;
    });

    // Pipeline success rate
    const runs = actions?.workflow_runs || [];
    const pipelineSuccess = Math.round((runs.filter(r => r.conclusion === 'success').length / Math.max(1, runs.length)) * 100);

    res.json({
      repo: {
        name: repoInfo.name,
        full_name: repoInfo.full_name,
        stargazers_count: repoInfo.stargazers_count,
        forks_count: repoInfo.forks_count,
        open_issues_count: repoInfo.open_issues_count,
        updated_at: repoInfo.updated_at,
        default_branch: repoInfo.default_branch
      },
      ai_insights: {
        health_grade: health.grade,
        health_label: health.label,
        health_color: health.color,
        doc_score: docScore,
        resolution_rate: resolutionRate,
        stale_issues_count: staleIssues.length,
        pipeline_health: pipelineSuccess,
        bus_factor: validContributorsBusFactor(contributors)
      },
      pr_metrics: {
        merged_prs: mergedPRs.length,
        open_prs: pullRequests.filter(pr => !pr.closed_at).length,
        merge_velocity: mergeVelocity,
        lead_time_days: calculateLeadTime(mergedPRs)
      },
      technical_metrics: {
        code_churn: Array.isArray(ccRes) ? ccRes.slice(-14).map(w => ({ additions: w[1], deletions: Math.abs(w[2]) })) : [],
        languages: languages || {},
        latest_release: latestRelease?.tag_name || 'N/A'
      },
      activity_metrics: {
        commit_activity: Array.isArray(caRes) ? caRes : [],
        peak_hours: hourlyDistribution,
        top_contributors: (Array.isArray(contributors) ? contributors : []).slice(0, 5).map(c => ({
          login: c.login,
          avatar_url: c.avatar_url,
          contributions: c.contributions
        }))
      },
      community_standards: {
        readme: !!community?.files?.readme,
        license: !!community?.files?.license,
        contributing: !!community?.files?.contributing,
        security: !!community?.files?.security_policy
      },
      _isStatsPending: (caRes?._isPending || ccRes?._isPending)
    });
  } catch (err) {
    res.status(500).json({ message: "Engine Sync Failure." });
  }
};

const calculateLeadTime = (mergedPRs) => {
  if (mergedPRs.length === 0) return 0;
  const total = mergedPRs.reduce((sum, pr) => sum + (new Date(pr.merged_at) - new Date(pr.created_at)), 0);
  return Math.round(total / mergedPRs.length / (1000 * 60 * 60 * 24));
};

const validContributorsBusFactor = (contributors) => {
  const list = Array.isArray(contributors) ? contributors : [];
  if (list.length === 0) return 0;
  const total = list.reduce((sum, c) => sum + (c.contributions || 0), 0);
  let running = 0, count = 0;
  for (const c of list) {
    running += (c.contributions || 0);
    count++;
    if (running >= total / 2) break;
  }
  return count;
};
