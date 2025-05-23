import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
});

export function login(username: string, password: string) {
  return api.post("/api/login", { username, password });
}

export function register(username: string, password: string) {
  return api.post("/api/register", { username, password });
}

export default api;
