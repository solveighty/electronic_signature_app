import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
});

export function login(email: string, password: string) {
  return api.post("/api/login", { email, password });
}

export function register(name: string, email: string,password: string,) {
  return api.post("/api/register", { name, email, password });
}

export default api;