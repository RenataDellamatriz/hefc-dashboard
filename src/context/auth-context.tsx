import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { signIn, getUserData } from "@/api";
import { loginSchema } from "@/schemas/schema";
import { z } from "zod";
import { User } from "@/types/user";

export type LoginFormValues = z.infer<typeof loginSchema>;

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  login: (data: LoginFormValues) => Promise<string>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  isAuthenticated: false,
  user: null,
  isAdmin: false,
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
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  const isAuthenticated = !!token;
  const isAdmin = user?.role == "admin";

  console.log("isAdmin", isAdmin);
  console.log("user", user);

  useEffect(() => {
    const fetchUserData = async () => {
      if (token && !user) {
        try {
          const userData = await getUserData();
          console.log("userData", userData);
          setUser(userData);
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);

          setToken(null);
          localStorage.removeItem("bearerToken");
        }
      }
    };

    fetchUserData();
  }, [token, user]);

  const login = async (data: LoginFormValues) => {
    const response = await signIn(data);
console.log("response", response)
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
    setUser(null);
    localStorage.removeItem("bearerToken");
    router.push("/auth");
  };

  return (
    <AuthContext.Provider
      value={{ login, logout, token, isAuthenticated, user, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
