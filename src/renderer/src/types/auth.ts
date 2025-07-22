export type AuthContextType = {
  token: string | null;
  userName: string | null;
  setToken: (token: string | null) => void;
  setUserName: (name: string | null) => void;
};