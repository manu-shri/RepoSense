import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getHealthStatus = async () => {
  const { data } = await api.get("/health");
  return data;
};

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

export const getGithubDashboard = async (owner, repo) => {
  const { data } = await api.get("/github/dashboard", { params: { owner, repo } });
  return data;
};

export default api;
