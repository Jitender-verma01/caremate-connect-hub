
import { toast } from "sonner";

// Update this with your actual API URL
const API_BASE_URL = "https://careplus-backend-220n.onrender.com/api/vi/";

// Common headers for API requests
const defaultHeaders = {
  "Content-Type": "application/json",
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "An unknown error occurred" }));
    throw new Error(errorData.message || `Error: ${response.status}`);
  }
  
  // For responses with no content
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

// Generic API request function
export const apiRequest = async (
  endpoint: string,
  method: string = "GET",
  data?: any,
  customHeaders = {}
) => {
  try {
    // Get auth token from localStorage (if you implement JWT)
    const token = localStorage.getItem('caremate_auth_token');
    
    const headers = {
      ...defaultHeaders,
      ...customHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const config: RequestInit = {
      method,
      headers,
      credentials: "include", // For cookies if needed
    };

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return await handleResponse(response);
  } catch (error) {
    console.error("API request failed:", error);
    toast.error(error instanceof Error ? error.message : "Request failed");
    throw error;
  }
};

// API service with methods for different resources
export const api = {
  // Auth endpoints
  auth: {
    login: (credentials: { email: string; password: string }) => 
      apiRequest("/auth/login", "POST", credentials),
    
    register: (userData: { 
      name: string; 
      email: string; 
      password: string; 
      role: 'patient' | 'doctor' 
    }) => apiRequest("/auth/register", "POST", userData),
    
    logout: () => apiRequest("/auth/logout", "POST"),
    
    getCurrentUser: () => apiRequest("/auth/me")
  },
  
  // Doctors endpoints
  doctors: {
    getAll: (params?: { specialty?: string; name?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.specialty) queryParams.append('specialty', params.specialty);
      if (params?.name) queryParams.append('name', params.name);
      
      const queryString = queryParams.toString();
      return apiRequest(`/doctors${queryString ? `?${queryString}` : ''}`);
    },
    
    getById: (id: string) => apiRequest(`/doctors/${id}`),
    
    getAvailability: (id: string, date: string) => 
      apiRequest(`/doctors/${id}/availability?date=${date}`)
  },
  
  // Appointments endpoints
  appointments: {
    getAll: () => apiRequest("/appointments"),
    
    getById: (id: string) => apiRequest(`/appointments/${id}`),
    
    create: (appointmentData: {
      doctorId: string;
      date: string;
      time: string;
      consultationType: string;
      reason?: string;
    }) => apiRequest("/appointments", "POST", appointmentData),
    
    update: (id: string, data: any) => 
      apiRequest(`/appointments/${id}`, "PUT", data),
    
    cancel: (id: string) => apiRequest(`/appointments/${id}`, "DELETE")
  },
  
  // Prescriptions endpoints
  prescriptions: {
    getAll: () => apiRequest("/prescriptions"),
    
    getById: (id: string) => apiRequest(`/prescriptions/${id}`)
  }
};
