import { createContext, useContext, useState, ReactNode } from "react";
import { handleSetToken } from "../utils/auth/auth";
import { AuthContextType } from "../types/auth";

// Ampliar el tipo para incluir id
type AuthContextWithId = AuthContextType & { userId: string | null; setUserId: (id: string | null) => void };
const AuthContext = createContext<AuthContextWithId | undefined>(undefined);

// Componente proveedor
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  const setToken = (newToken: string | null) => {
    handleSetToken(setTokenState, newToken);
  };

  return (
    <AuthContext.Provider value={{ token, userName, isAdmin, setToken, setUserName, setIsAdmin, userId, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};