
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
  profileImage?: string;
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
    // Check for stored user on app load
    const storedUser = localStorage.getItem('caremate_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem('caremate_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would make an API call to authenticate
      console.log("Logging in with:", email, password);
      
      // Mock login - replace with actual API call
      const mockUser: User = {
        id: '123',
        name: 'John Doe',
        email: email,
        role: email.includes('doctor') ? 'doctor' : 'patient',
      };
      
      setUser(mockUser);
      localStorage.setItem('caremate_user', JSON.stringify(mockUser));
      toast.success("Login successful!");
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
      // In a real app, this would make an API call to register
      console.log("Registering with:", userData);
      
      // Mock registration - replace with actual API call
      const mockUser: User = {
        id: '123',
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };
      
      setUser(mockUser);
      localStorage.setItem('caremate_user', JSON.stringify(mockUser));
      toast.success("Registration successful!");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('caremate_user');
    toast.info("You have been logged out.");
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
