import axios from "axios";

const API_BASE_URL = "http://localhost:8888/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AUTHENTICATION EXPORTS (Restored)
export const signup = async (payload) => {
  const { data } = await api.post("/auth/signup", payload);
  return data;
};

export const login = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

// GITHUB ANALYTICS EXPORTS
export const getGithubDashboard = async (owner, repo) => {
  const { data } = await api.get(`/github/dashboard`, { params: { owner, repo } });
  return data;
};

export const getBenchmark = async (owner, repo) => {
  const { data } = await api.get(`/github/benchmark`, { params: { owner, repo } });
  return data;
};

export const getHealthStructure = async (owner, repo) => {
  const { data } = await api.get(`/github/health/structure`, { params: { owner, repo } });
  return data;
};

export const askHealthAI = async (prompt, context) => {
  const { data } = await api.post(`/github/health/ai-chat`, { prompt, context });
  return data;
};

export const getContributorIntelligence = async (owner, repo) => {
  const { data } = await api.get(`/github/contributors/intelligence?owner=${owner}&repo=${repo}`);
  return data;
};

export const getContributorPortfolio = async (username) => {
  const { data } = await api.get(`/github/contributors/portfolio/${username}`);
  return data;
};

export const getAiSummary = async (owner, repo) => {
  const { data } = await api.get(`/github/ai-summary`, { params: { owner, repo } });
  return data;
};

export default api;
