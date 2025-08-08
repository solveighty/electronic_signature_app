import { createContext, useContext, useState, ReactNode } from "react";
import { handleSetToken } from "../utils/auth/auth";
import { AuthContextType } from "../types/auth";

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente proveedor
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const setToken = (newToken: string | null) => {
    handleSetToken(setTokenState, newToken);
  };

  return (
    <AuthContext.Provider value={{ token, userName, isAdmin, setToken, setUserName, setIsAdmin }}>
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