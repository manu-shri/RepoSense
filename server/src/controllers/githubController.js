const GH_API = "https://api.github.com";

const withHeaders = () => {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "RepoSense",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const ghGet = async (path) => {
  const res = await fetch(`${GH_API}${path}`, { headers: withHeaders() });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && data.message) ||
      `GitHub API error (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data;
};

// Helper function to calculate average merge time
const calculateAverageMergeTime = (pullRequests) => {
  const mergedPRs = pullRequests.filter(pr => pr.merged_at);
  if (mergedPRs.length === 0) return null;
  
  const totalTime = mergedPRs.reduce((sum, pr) => {
    const created = new Date(pr.created_at);
    const merged = new Date(pr.merged_at);
    return sum + (merged - created);
  }, 0);
  
  return Math.round(totalTime / mergedPRs.length / (1000 * 60 * 60 * 24)); // days
};

// Helper function to calculate issue resolution time
const calculateIssueResolutionTime = (issues) => {
  const closedIssues = issues.filter(issue => issue.state === 'closed' && issue.closed_at);
  if (closedIssues.length === 0) return null;
  
  const totalTime = closedIssues.reduce((sum, issue) => {
    const created = new Date(issue.created_at);
    const closed = new Date(issue.closed_at);
    return sum + (closed - created);
  }, 0);
  
  return Math.round(totalTime / closedIssues.length / (1000 * 60 * 60 * 24)); // days
};

// Helper function to detect stale issues (older than 30 days and still open)
const getStaleIssuesCount = (issues) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return issues.filter(issue => 
    issue.state === 'open' && 
    new Date(issue.created_at) < thirtyDaysAgo
  ).length;
};

// Helper function to get repository activity status
const getActivityStatus = (repoInfo, lastCommitDate) => {
  const lastActivity = new Date(repoInfo.pushed_at);
  const now = new Date();
  const daysSinceActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysSinceActivity <= 7) return 'active';
  if (daysSinceActivity <= 30) return 'moderate';
  if (daysSinceActivity <= 90) return 'inactive';
  return 'abandoned';
};

// Helper function to detect frameworks from package.json and dependencies
const detectFrameworks = (languages, repoContent) => {
  const frameworks = [];
  const langKeys = Object.keys(languages || {});
  
  // Language-based detection
  if (langKeys.includes('JavaScript') || langKeys.includes('TypeScript')) {
    frameworks.push('JavaScript/TypeScript');
  }
  if (langKeys.includes('Python')) {
    frameworks.push('Python');
  }
  if (langKeys.includes('Java')) {
    frameworks.push('Java');
  }
  if (langKeys.includes('Go')) {
    frameworks.push('Go');
  }
  if (langKeys.includes('Rust')) {
    frameworks.push('Rust');
  }
  
  return frameworks;
};

// Helper function to detect CI/CD from workflows
const detectCICD = async (owner, repo) => {
  try {
    const workflows = await ghGet(`/repos/${owner}/${repo}/contents/.github/workflows`);
    return workflows.length > 0;
  } catch {
    return false;
  }
};

// Helper function to count dependencies
const getDependencyCount = async (owner, repo) => {
  try {
    let count = 0;
    const files = ['package.json', 'requirements.txt', 'pom.xml', 'Cargo.toml', 'go.mod'];
    
    for (const file of files) {
      try {
        const content = await ghGet(`/repos/${owner}/${repo}/contents/${file}`);
        if (content) count++;
      } catch {
        // File doesn't exist
      }
    }
    
    return count;
  } catch {
    return 0;
  }
};

// Helper function to score README
const scoreReadme = async (owner, repo) => {
  try {
    const readme = await ghGet(`/repos/${owner}/${repo}/contents/README.md`);
    let score = 0;
    
    if (readme) {
      score += 30; // Has README
      
      // Check for common sections (this is simplified)
      const content = atob(readme.content);
      if (content.includes('## Installation')) score += 20;
      if (content.includes('## Usage')) score += 20;
      if (content.includes('## Contributing')) score += 15;
      if (content.includes('## License')) score += 15;
    }
    
    return Math.min(score, 100);
  } catch {
    return 0;
  }
};

// Helper function to check community health files
const checkCommunityHealthFiles = async (owner, repo) => {
  const healthFiles = [
    'CODE_OF_CONDUCT.md',
    'CONTRIBUTING.md',
    'LICENSE',
    'SECURITY.md',
    'SUPPORT.md'
  ];
  
  const foundFiles = [];
  
  for (const file of healthFiles) {
    try {
      await ghGet(`/repos/${owner}/${repo}/contents/${file}`);
      foundFiles.push(file);
    } catch {
      // File doesn't exist
    }
  }
  
  return {
    count: foundFiles.length,
    files: foundFiles,
    score: Math.round((foundFiles.length / healthFiles.length) * 100)
  };
};

export const getRepoDashboard = async (req, res) => {
  try {
    const owner = (req.query.owner || "public-apis").toString();
    const repo = (req.query.repo || "public-apis").toString();

    const repoInfo = await ghGet(`/repos/${owner}/${repo}`);

    // Basic stats
    const commitActivity = await ghGet(`/repos/${owner}/${repo}/stats/commit_activity`);
    
    let contributors = [];
    try {
      contributors = await ghGet(`/repos/${owner}/${repo}/contributors?per_page=10`);
    } catch {
      contributors = [];
    }

    let languages = {};
    try {
      languages = await ghGet(`/repos/${owner}/${repo}/languages`);
    } catch {
      languages = {};
    }

    // PRs analysis
    let pullRequests = [];
    try {
      const openPRs = await ghGet(`/repos/${owner}/${repo}/pulls?state=open&per_page=100`);
      const closedPRs = await ghGet(`/repos/${owner}/${repo}/pulls?state=closed&per_page=100`);
      pullRequests = [...openPRs, ...closedPRs];
    } catch {
      pullRequests = [];
    }

    const openPRsCount = pullRequests.filter(pr => pr.state === 'open').length;
    const mergedPRsCount = pullRequests.filter(pr => pr.merged_at).length;
    const averagePRMergeTime = calculateAverageMergeTime(pullRequests);

    // Issues analysis
    let issues = [];
    try {
      const openIssues = await ghGet(`/repos/${owner}/${repo}/issues?state=open&per_page=100`);
      const closedIssues = await ghGet(`/repos/${owner}/${repo}/issues?state=closed&per_page=100`);
      issues = [...openIssues, ...closedIssues];
    } catch {
      issues = [];
    }

    const staleIssuesCount = getStaleIssuesCount(issues);
    const averageIssueResolutionTime = calculateIssueResolutionTime(issues);

    // Commits analysis
    let commits = [];
    try {
      commits = await ghGet(`/repos/${owner}/${repo}/commits?per_page=100`);
    } catch {
      commits = [];
    }

    const lastCommitDate = commits.length > 0 ? commits[0].commit.author.date : null;
    const activityStatus = getActivityStatus(repoInfo, lastCommitDate);

    // Releases
    let releases = [];
    try {
      releases = await ghGet(`/repos/${owner}/${repo}/releases?per_page=50`);
    } catch {
      releases = [];
    }

    // Calculate release frequency (releases per year)
    let releaseFrequency = 0;
    if (releases.length > 0) {
      const oldestRelease = new Date(releases[releases.length - 1].created_at);
      const daysSinceOldest = Math.max(1, (new Date() - oldestRelease) / (1000 * 60 * 60 * 24));
      const yearsSinceOldest = daysSinceOldest / 365;
      releaseFrequency = Math.round((releases.length / yearsSinceOldest) * 10) / 10;
    }

    // Peak coding hours (analyze commit timestamps)
    const commitHours = commits.map(commit => {
      const hour = new Date(commit.commit.author.date).getHours();
      return hour;
    });
    
    const hourCounts = commitHours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});
    
    const peakCodingHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Advanced metrics
    const frameworks = detectFrameworks(languages);
    const hasCICD = await detectCICD(owner, repo);
    const dependencyCount = await getDependencyCount(owner, repo);
    const readmeScore = await scoreReadme(owner, repo);
    const communityHealth = await checkCommunityHealthFiles(owner, repo);

    // Enhanced contributor leaderboard
    const contributorLeaderboard = contributors.slice(0, 10).map((contributor, index) => ({
      rank: index + 1,
      login: contributor.login,
      contributions: contributor.contributions,
      avatar_url: contributor.avatar_url,
      html_url: contributor.html_url
    }));

    res.json({
      repo: {
        name: repoInfo.name,
        full_name: repoInfo.full_name,
        html_url: repoInfo.html_url,
        description: repoInfo.description,
        owner: repoInfo.owner?.login,
        stargazers_count: repoInfo.stargazers_count,
        forks_count: repoInfo.forks_count,
        open_issues_count: repoInfo.open_issues_count,
        watchers_count: repoInfo.watchers_count,
        size: repoInfo.size,
        updated_at: repoInfo.updated_at,
        pushed_at: repoInfo.pushed_at,
        default_branch: repoInfo.default_branch,
        created_at: repoInfo.created_at,
        language: repoInfo.language,
        license: repoInfo.license?.name || null,
      },
      
      // PR Metrics
      pr_metrics: {
        open_prs: openPRsCount,
        merged_prs: mergedPRsCount,
        average_merge_time_days: averagePRMergeTime,
        total_prs: pullRequests.length
      },

      // Issue Metrics
      issue_metrics: {
        stale_issues_count: staleIssuesCount,
        average_resolution_time_days: averageIssueResolutionTime,
        total_issues: issues.length
      },

      // Activity Metrics
      activity_metrics: {
        last_commit_date: lastCommitDate,
        activity_status: activityStatus,
        release_frequency_per_year: releaseFrequency,
        total_releases: releases.length
      },

      // Community Metrics
      community_metrics: {
        contributor_leaderboard: contributorLeaderboard,
        total_contributors: contributors.length,
        readme_score: readmeScore,
        community_health_files: communityHealth
      },

      // Technical Metrics
      technical_metrics: {
        frameworks_detected: frameworks,
        has_cicd: hasCICD,
        dependency_count: dependencyCount,
        peak_coding_hours: peakCodingHours
      },

      // Original data
      commit_activity: commitActivity,
      languages,
      
      rate_limit_note: process.env.GITHUB_TOKEN
        ? "Authenticated GitHub API"
        : "Unauthenticated GitHub API (rate-limited)",
    });
  } catch (err) {
    // Handle 202 from stats endpoints
    if (err?.status === 202) {
      return res.status(202).json({
        message: "GitHub is generating statistics for this repo. Try again in 10-30 seconds.",
      });
    }
    res.status(err?.status || 500).json({
      message: err?.message || "Server error",
      details: err?.details,
    });
  }
};

