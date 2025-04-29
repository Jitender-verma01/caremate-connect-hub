
import { toast } from "sonner";

// Update with your actual backend API URL
const API_BASE_URL = "http://localhost:5000/api/v1";

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
    // Get auth token from localStorage
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
      apiRequest("/user/login", "POST", credentials),
    
    register: (userData: { 
      name: string; 
      email: string; 
      password: string; 
      role: 'patient' | 'doctor';
      phoneNumber?: number;
    }) => apiRequest("/user/register", "POST", userData),
    
    logout: () => apiRequest("/user/logout", "POST"),
    
    getCurrentUser: () => apiRequest("/user/current-user")
  },
  
  // Doctors endpoints
  doctors: {
    getAll: (params?: { specialization?: string; name?: string; experience?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.specialization) queryParams.append('specialization', params.specialization);
      if (params?.name) queryParams.append('name', params.name);
      if (params?.experience) queryParams.append('experience', params.experience.toString());
      
      const queryString = queryParams.toString();
      return apiRequest(`/doctor/all-doctors${queryString ? `?${queryString}` : ''}`);
    },
    
    getById: (id: string) => apiRequest(`/doctor/profile/${id}`),
    
    getProfile: () => apiRequest('/doctor/profile'),
    
    getBySpecialization: (specialization: string) => 
      apiRequest(`/doctor/specialization?specialization=${specialization}`),
    
    getAvailability: (id: string, date: string) => 
      apiRequest(`/doctor/available-slots-for-doctor/${id}?date=${date}`)
  },
  
  // Patient endpoints
  patients: {
    createProfile: (formData: FormData) => 
      apiRequest("/patient/create-profile", "POST", formData, { "Content-Type": undefined }),
    
    getProfile: () => apiRequest("/patient/profile"),
    
    getById: (id: string) => apiRequest(`/patient/profile/${id}`),
    
    updateProfile: (data: any) => apiRequest("/patient/update", "PATCH", data),
    
    updateProfileImage: (formData: FormData) => 
      apiRequest("/patient/update-image", "PATCH", formData, { "Content-Type": undefined })
  },
  
  // Appointments endpoints
  appointments: {
    create: (appointmentData: {
      doctorId: string;
      date: string;
      time: string;
      consultationType: string;
      reason?: string;
    }) => apiRequest("/appointment", "POST", appointmentData),
    
    getById: (id: string) => apiRequest(`/appointment/${id}`),
    
    getPatientAppointments: (patientId: string) => 
      apiRequest(`/appointment/${patientId}/appointments`),
    
    getDoctorAppointments: (doctorId: string) => 
      apiRequest(`/appointment/${doctorId}/appointments`),
    
    cancel: (id: string) => apiRequest(`/appointment/cancel/${id}`, "PATCH"),
    
    updateStatus: (id: string, status: string) => 
      apiRequest(`/appointment/update/${id}`, "PATCH", { status })
  },
  
  // Prescriptions endpoints
  prescriptions: {
    create: (data: any) => apiRequest("/prescription/create-prescription", "POST", data),
    
    getById: (id: string) => apiRequest(`/prescription/get-prescription/${id}`),
    
    getForPatient: (patientId: string) => 
      apiRequest(`/prescription/get-prescriptions-for-patient?patientId=${patientId}`),
    
    update: (id: string, data: any) => 
      apiRequest(`/prescription/update-prescription/${id}`, "PATCH", data),
    
    delete: (id: string) => 
      apiRequest(`/prescription/delete-prescription/${id}`, "DELETE")
  }
};
