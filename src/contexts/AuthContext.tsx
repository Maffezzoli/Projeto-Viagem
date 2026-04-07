import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GATE_PASSWORD = import.meta.env.VITE_GATE_PASSWORD || 'senha1234';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('AuthProvider inicializando...');
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const auth = localStorage.getItem('app_viagem_auth') === 'true';
      console.log('Estado inicial de autenticação:', auth);
      return auth;
    } catch (e) {
      console.error('Erro ao acessar localStorage:', e);
      return false;
    }
  });

  const login = (password: string) => {
    if (password === GATE_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('app_viagem_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('app_viagem_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
