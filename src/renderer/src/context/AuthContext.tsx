import { createContext, useContext, useState, ReactNode } from "react";
import { setAuthToken } from "../utils/api";

// Tipado del contexto
type AuthContextType = {
  token: string | null;
  userName: string | null;
  setToken: (token: string | null) => void;
  setUserName: (name: string | null) => void;
};

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente proveedor
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    setAuthToken(newToken); // Configurar el token en el interceptor de axios
  };

  return (
    <AuthContext.Provider value={{ token, userName, setToken, setUserName }}>
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