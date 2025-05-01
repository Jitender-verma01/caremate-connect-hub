import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { api } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
  profileImage?: string;
  phoneNumber?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: 'patient' | 'doctor';
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load user data from token on app initialization
    const loadUser = async () => {
      const token = localStorage.getItem('caremate_auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await api.auth.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user:", error);
        // Clear invalid token
        localStorage.removeItem('caremate_auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.auth.login({ email, password });
      
      // Handle the response structure properly
      // The backend returns { data: { user, accessToken } }
      if (response && response.data && response.data.accessToken) {
        localStorage.setItem('caremate_auth_token', response.data.accessToken);
        setUser(response.data.user);
        toast.success("Login successful!");
      } else {
        // If response structure is not as expected
        console.error("Unexpected response structure:", response);
        toast.error("Login failed. Unexpected response format.");
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'patient' | 'doctor';
  }) => {
    setIsLoading(true);
    try {
      const response = await api.auth.register(userData);
      
      // Store the token - ensure we're using the correct response structure
      if (response.data && response.data.accessToken) {
        localStorage.setItem('caremate_auth_token', response.data.accessToken);
        setUser(response.data.user);
      } else if (response.accessToken) {
        localStorage.setItem('caremate_auth_token', response.accessToken);
        setUser(response.user);
      } else {
        console.error("Unexpected registration response structure:", response);
        toast.error("Registration succeeded but session creation failed.");
      }
      
      toast.success("Registration successful!");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local state even if API call fails
      localStorage.removeItem('caremate_auth_token');
      setUser(null);
      toast.info("You have been logged out.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
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
