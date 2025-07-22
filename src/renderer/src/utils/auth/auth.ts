import { setAuthToken } from "../api/endpoints/auth/authApi";

export function handleSetToken(setTokenState: (token: string | null) => void, newToken: string | null) {
  setTokenState(newToken);
  setAuthToken(newToken);
}