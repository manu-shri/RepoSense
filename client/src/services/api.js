import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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

export default api;
