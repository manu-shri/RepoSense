const GH_API = "https://api.github.com";

const withHeaders = () => {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "RepoSense",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `token ${token}`;
  }
  return headers;
};

const ghGet = async (path, timeout = 15000) => {
  const url = `${GH_API}${path}`;
  try {
    const res = await fetch(url, { 
      headers: withHeaders(),
      signal: AbortSignal.timeout(timeout)
    });
    
    if (res.status === 202) return { _isPending: true };
    if (res.status === 404) return { _isNotFound: true };
    if (res.status === 403) return { _isRateLimited: true };
    if (!res.ok) return null;

    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    return null;
  }
};

export const getBenchmarkData = async (req, res) => {
  try {
    const { owner, repo } = req.query;
    if (!owner || !repo) return res.status(400).json({ message: "Target required." });

    const eO = encodeURIComponent(owner);
    const eR = encodeURIComponent(repo);

    const repoInfo = await ghGet(`/repos/${eO}/${eR}`);
    if (!repoInfo || repoInfo._isNotFound) return res.status(404).json({ message: "Repository unreachable." });
    if (repoInfo._isRateLimited) return res.status(403).json({ message: "GitHub Rate Limit Reached." });

    const branch = repoInfo.default_branch || "main";

    const [batch1, batch2] = await Promise.all([
      Promise.all([
        ghGet(`/repos/${eO}/${eR}/git/trees/${branch}?recursive=1`),
        ghGet(`/repos/${eO}/${eR}/contents/package.json`),
        ghGet(`/repos/${eO}/${eR}/stats/commit_activity`),
        ghGet(`/repos/${eO}/${eR}/contributors?per_page=30`)
      ]),
      Promise.all([
        ghGet(`/repos/${eO}/${eR}/releases?per_page=10`),
        ghGet(`/repos/${eO}/${eR}/pulls?state=all&per_page=50`),
        ghGet(`/repos/${eO}/${eR}/issues?state=all&per_page=50`),
        ghGet(`/repos/${eO}/${eR}/commits?per_page=50`)
      ])
    ]);

    const [treeRes, packageRes, activityRes, contributorsRes] = batch1;
    const [releasesRes, pullsRes, issuesRes, commitsRes] = batch2;

    // 1. Complexity
    const tree = treeRes?.tree || [];
    const totalFiles = tree.length;
    const folderDepth = tree.reduce((max, t) => Math.max(max, t.path.split("/").length), 0);
    const complexityScore = Math.min(100, Math.max(10, Math.round((totalFiles / 500) * 40 + (folderDepth / 5) * 60)));

    // 2. Risk
    let depCount = 0;
    if (packageRes?.content) {
      try {
        const pkg = JSON.parse(Buffer.from(packageRes.content, 'base64').toString());
        depCount = Object.keys(pkg.dependencies || {}).length + Object.keys(pkg.devDependencies || {}).length;
      } catch (e) {}
    }
    const riskScore = Math.min(100, Math.max(5, (depCount * 1.5)));

    // 3. Growth
    const releases = Array.isArray(releasesRes) ? releasesRes : [];
    const contributors = Array.isArray(contributorsRes) ? contributorsRes : [];
    const growthScore = Math.min(100, Math.max(15, (contributors.length * 2) + (releases.length * 5)));
    
    // SAFE ARRAY ACCESS FOR ACTIVITY
    const activityStats = Array.isArray(activityRes) ? activityRes.slice(-12) : Array.from({length: 12}).map(() => ({total: 0}));

    // 4. Velocity
    const pulls = Array.isArray(pullsRes) ? pullsRes : [];
    const commits = Array.isArray(commitsRes) ? commitsRes : [];
    const velocityScore = Math.min(100, Math.max(10, (pulls.length * 1.5) + (commits.length / 2)));

    // 5. Community
    const issues = Array.isArray(issuesRes) ? issuesRes : [];
    const communityScore = Math.min(100, Math.max(10, (contributors.length * 3) + (issues.length / 2)));

    // 6. Technical Debt
    const staleIssues = issues.filter(i => {
      if (!i.updated_at) return false;
      const updated = new Date(i.updated_at);
      return (new Date() - updated) > (1000 * 60 * 60 * 24 * 30);
    }).length;
    const debtScore = Math.min(100, Math.max(5, (staleIssues * 10) + (repoInfo.open_issues_count / 2)));

    res.json({
      repo: {
        name: repoInfo.name,
        owner: repoInfo.owner.login,
        avatar: repoInfo.owner.avatar_url,
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        updated_at: repoInfo.updated_at,
        branch: branch
      },
      complexity: {
        score: complexityScore,
        total_files: totalFiles,
        folder_depth: folderDepth,
        nested_dirs: tree.filter(t => t.type === "tree").length,
        tree_preview: tree.slice(0, 50).map(t => ({ path: t.path, type: t.type }))
      },
      risk: {
        score: riskScore,
        dependency_count: depCount,
        vulnerabilities: 0
      },
      growth: {
        score: growthScore,
        contributor_count: contributors.length,
        release_count: releases.length,
        activity_stats: activityStats
      },
      velocity: {
        score: velocityScore,
        pr_throughput: pulls.length,
        commit_count: commits.length,
        release_cadence: releases.length > 0 ? "High" : "Stable"
      },
      community: {
        score: communityScore,
        contributor_retention: contributors.length > 10 ? "High" : "Developing",
        issue_participation: Math.min(100, Math.round((issues.length / 50) * 100))
      },
      debt: {
        score: debtScore,
        stale_issues: staleIssues,
        open_issues: repoInfo.open_issues_count
      }
    });
  } catch (err) {
    console.error("[Benchmark] Engine Fault:", err.message);
    res.status(500).json({ message: "Neural Engine Sync Error." });
  }
};
