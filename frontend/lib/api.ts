import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove("token");
      if (typeof window !== "undefined") window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authApi = {
  register: (email: string, password: string, confirm_password: string) =>
    api.post("/api/auth/register", { email, password, confirm_password }),
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  me: () => api.get("/api/auth/me"),
};

// Automations
export const automationsApi = {
  list: () => api.get("/api/automations/"),
  get: (id: number) => api.get(`/api/automations/${id}`),
  create: (data: Record<string, unknown>) => api.post("/api/automations/", data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/automations/${id}`, data),
  delete: (id: number) => api.delete(`/api/automations/${id}`),
  runNow: (id: number) => api.post(`/api/automations/${id}/run`),
  pause: (id: number) => api.post(`/api/automations/${id}/pause`),
  resume: (id: number) => api.post(`/api/automations/${id}/resume`),
};

// Reddit
export const redditApi = {
  me: () => api.get("/api/reddit/me"),
  posts: (subreddit: string, limit = 10) =>
    api.get(`/api/reddit/posts/${subreddit}?limit=${limit}`),
  defaultSubreddit: () => api.get("/api/reddit/default-subreddit"),
};
