import React, { createContext, useState, ReactNode, useContext } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/api";
import { loginSchema } from "@/schemas/schema";
import { z } from "zod";

export type LoginFormValues = z.infer<typeof loginSchema>;

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginFormValues) => Promise<string>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  isAuthenticated: false,
  login: async () => "",
  logout: () => {},
});

type AuthProviderProps = {
  children: ReactNode;
};

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AppProvider");
  }
  return context;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("bearerToken");
    }
    return null;
  });

  const router = useRouter();

  const isAuthenticated = !!token;

  const login = async (data: LoginFormValues) => {
    const response = await signIn(data);

    if (!response) {
      throw new Error("Login failed");
    }

    const token: string = response;

    if (typeof window !== "undefined" && token) {
      localStorage.setItem("bearerToken", token);
    }

    setToken(token);

    return token;
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("bearerToken");
    router.push("/auth");
  };

  return (
    <AuthContext.Provider value={{ login, logout, token, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
