"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  professionalData?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  isSignedIn: boolean;
  isCliente: boolean;
  isProfesional: boolean;
  isDraAnaFelicidad: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      console.log("🔍 useAuth: Checking authentication...");
      
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      });

      console.log("🔍 useAuth: API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ useAuth: User data received:", data.user);
        setUser(data.user);
      } else {
        console.log("❌ useAuth: Auth check failed with status:", response.status);
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.log("❌ useAuth: Error details:", errorData);
        setUser(null);
      }
    } catch (error) {
      console.error("❌ useAuth: Error checking auth:", error);
      setUser(null);
    } finally {
      console.log("🔍 useAuth: Auth check completed");
      setAuthChecked(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        router.push("/");
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error en login:", error);
      return false;
    }
  };

  const register = async (registrationData: any) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        router.push("/");
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error en registro:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Error en logout:", error);
    }
  };

  const value = {
    user,
    loading: loading || !authChecked,
    login,
    register,
    logout,
    isSignedIn: !!user,
    isCliente: user?.role === "cliente",
    isProfesional: user?.role === "professional",
    isDraAnaFelicidad: user?.role === "dra_ana_felicidad",
  };

  // Log the complete state for debugging
  console.log("🔍 useAuth: Complete state:", {
    user: user ? { id: user.id, role: user.role, name: `${user.firstName} ${user.lastName}` } : null,
    loading,
    authChecked,
    isSignedIn: !!user,
    isDraAnaFelicidad: user?.role === "dra_ana_felicidad"
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 