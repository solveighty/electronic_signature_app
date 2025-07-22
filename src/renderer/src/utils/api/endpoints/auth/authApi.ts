import api from "../../config/axiosConfig";

// Login
export function login(email: string, password: string) {
  return api.post("/api/auth/login", { email, password });
}

// Register
export function register(name: string, email: string, password: string) {
  return api.post("/api/auth/register", { name, email, password });
}

// Token interceptor
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};