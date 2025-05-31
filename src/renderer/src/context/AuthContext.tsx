import { createContext, useContext, useState, ReactNode } from "react";

// Tipado del contexto
type AuthContextType = {
  token: string | null;
  setToken: (token: string | null) => void;
};

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente proveedor
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
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