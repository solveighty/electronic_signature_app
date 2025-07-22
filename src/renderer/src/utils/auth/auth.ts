import { setAuthToken } from "../api/api";

export function handleSetToken(setTokenState: (token: string | null) => void, newToken: string | null) {
  setTokenState(newToken);
  setAuthToken(newToken);
}