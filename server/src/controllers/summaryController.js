import { GoogleGenerativeAI } from "@google/generative-ai";
import Summary from "../models/Summary.js";

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

const ghGet = async (path) => {
  const url = `${GH_API}${path}`;
  try {
    const res = await fetch(url, { headers: withHeaders() });
    if (!res.ok) {
      if (res.status === 404) return { _isNotFound: true };
      return null;
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.error("[Summary API] GitHub Fetch Error:", err.message);
    return null;
  }
};

export const getAiRepoSummary = async (req, res) => {
  try {
    let { owner, repo } = req.query;
    if (!owner || !repo) {
      return res.status(400).json({ message: "Repository target required." });
    }

    owner = owner.trim().split('?')[0].split('#')[0].replace(/\/$/, "");
    repo = repo.trim().split('?')[0].split('#')[0].replace(/\/$/, "").replace(/\.git$/, "");

    const apiKey = process.env.GEMINI_API_KEY;
    console.log("DEBUG API KEY:", apiKey);
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      return res.status(500).json({ 
        message: "Neural Core Offline. GEMINI_API_KEY is missing or invalid in server environment." 
      });
    }

    // Check Cache
    const existingSummary = await Summary.findOne({ 
      owner: owner.toLowerCase(), 
      repo: repo.toLowerCase() 
    });

    if (existingSummary) {
      console.log(`[Summary API] Serving cached summary for ${owner}/${repo}`);
      return res.json({ summary: existingSummary.summaryContent });
    }

    const eO = encodeURIComponent(owner);
    const eR = encodeURIComponent(repo);

    // Fetch repository metadata, README, and root contents concurrently
    const [repoInfo, readmeInfo, contentsInfo] = await Promise.all([
      ghGet(`/repos/${eO}/${eR}`),
      ghGet(`/repos/${eO}/${eR}/readme`),
      ghGet(`/repos/${eO}/${eR}/contents`)
    ]);

    if (!repoInfo || repoInfo._isNotFound) {
      return res.status(404).json({ message: "Repository unreachable or not found." });
    }

    let readmeContent = "No README provided.";
    if (readmeInfo && readmeInfo.content) {
      try {
        // GitHub returns base64 encoded content
        readmeContent = Buffer.from(readmeInfo.content, 'base64').toString('utf-8');
      } catch (e) {
        readmeContent = "Error decoding README.";
      }
    }

    // Truncate README if it's absurdly large, though Gemini handles 1M-2M tokens easily
    if (readmeContent.length > 500000) {
      readmeContent = readmeContent.substring(0, 500000) + "... [Truncated]";
    }

    let structureContent = "No directory structure available.";
    if (Array.isArray(contentsInfo)) {
      structureContent = contentsInfo.map(item => `- ${item.name} (${item.type})`).join("\n");
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
You are an elite Senior Software Architect analyzing a GitHub repository.

Repository: ${repoInfo.full_name}
Description: ${repoInfo.description || "None provided"}
Primary Language: ${repoInfo.language || "Unknown"}
Stars: ${repoInfo.stargazers_count}
Forks: ${repoInfo.forks_count}

Below is the Root Directory Structure of the repository:
=========================================
${structureContent}
=========================================

Below is the raw README.md content of the repository:
=========================================
${readmeContent}
=========================================

Based on this information, provide a comprehensive, beautifully formatted Markdown review of the repository. Include:
1. An executive summary (What does this project do?)
2. Core Features & Capabilities
3. Target Audience & Use Cases
4. Architecture & Tech Stack (Inferred from the README and Directory Structure)
5. Developer Experience (Is it easy to set up? Is documentation good?)

Be professional, insightful, and format your output beautifully using standard Markdown headers, bold text, and bullet points. Do not wrap the entire response in a markdown code block (\`\`\`markdown). Just output the markdown directly.
    `.trim();

    let result;
    let retries = 3;
    let delay = 2000;
    while (retries > 0) {
      try {
        result = await model.generateContent(prompt);
        break; // Success
      } catch (e) {
        console.warn(`[Summary API] AI Generation Error: ${e.message}. Retries left: ${retries - 1}`);
        
        // Don't retry if it's a hard quota limit (429 Daily Limit)
        if (e.message.includes("429 Too Many Requests") || e.message.includes("quota")) {
          return res.status(429).json({ message: "Gemini API Daily Quota Exceeded. You have reached your limit of AI requests for today. Please try again tomorrow or upgrade your API key." });
        }

        if (retries > 1) {
          retries--;
          await new Promise(r => setTimeout(r, delay));
          delay *= 2; // exponential backoff
        } else {
          throw e;
        }
      }
    }
    const aiResponse = result.response.text();

    // Save to Cache
    await Summary.create({
      owner: owner.toLowerCase(),
      repo: repo.toLowerCase(),
      summaryContent: aiResponse
    });

    return res.json({ summary: aiResponse });
  } catch (err) {
    console.error("[Summary API] AI Generation Error:", err.message);
    res.status(500).json({ message: "Neural Engine Sync Error. Failed to generate AI summary." });
  }
};
