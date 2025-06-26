import { toast } from "sonner";

// Update with your actual backend API URL
const API_BASE_URL = "https://caremate-connect-hub.onrender.com/api/v1";
// https://caremate-connect-hub.onrender.com
// Common headers for API requests
const defaultHeaders: Record<string, string> = {
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
  customHeaders: Record<string, string> = {}
) => {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('caremate_auth_token');
    
    const headers: Record<string, string> = {
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
      // If data is FormData, don't stringify it and remove Content-Type header
      if (data instanceof FormData) {
        const newHeaders = { ...headers };
        // Use delete operator on a copied object property instead
        if ('Content-Type' in newHeaders) {
          delete newHeaders['Content-Type'];
        }
        config.headers = newHeaders;
        config.body = data;
      } else {
        config.body = JSON.stringify(data);
      }
    }

    console.log(`Making ${method} request to ${endpoint} with token:`, token ? "Present" : "Absent");
    if (data) {
      console.log("Request data:", data);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const responseData = await handleResponse(response);
    
    console.log(`Response from ${endpoint}:`, responseData);
    
    return responseData;
  } catch (error) {
    console.error("API request failed:", error);
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
    
    getCurrentUser: () => apiRequest("/user/current-user"),

    updateAccountDetails: (data: { 
      name: string; 
      email: string; 
      phoneNumber?: number;
    }) => apiRequest("/user/update-account-details", "PATCH", data),

    changePassword: (data: {
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => apiRequest("/user/change-password", "PATCH", data)
  },
  
  // Doctors endpoints
  doctors: {
    getAll: (params?: { specialization?: string; name?: string; experience?: number ; minRating?: number}) => {
      const queryParams = new URLSearchParams();
      if (params?.specialization) queryParams.append('specialization', params.specialization);
      if (params?.name) queryParams.append('name', params.name);
      if (params?.experience) queryParams.append('experience', params.experience.toString());
      if (params?.minRating) queryParams.append('minRating', params.minRating.toString());
      
      const queryString = queryParams.toString();
      return apiRequest(`/doctor/all-doctors${queryString ? `?${queryString}` : ''}`);
    },
    
    getById: (id: string) => apiRequest(`/doctor/profile/${id}`),

    getProfile: () => apiRequest('/doctor/profile'),

    getBySpecialization: (specialization: string) => 
      apiRequest(`/doctor/specialization?specialization=${specialization}`),
    
    getAvailability: (id: string, date: string) => 
      apiRequest(`/doctor/available-slots-for-doctor/${id}?date=${date}`),
    
    createDoctor: (formData: FormData) => 
      apiRequest("/doctor/create", "POST", formData),
    
    updateDoctorProfile: (data: {
      specialization: string;
      fees: number;
      qualification: string;
      experience: number;
      about: string;
      languages: string;
    }) => apiRequest("/doctor/update", "PATCH", data),
    
    updateProfileImage: (formData: FormData) => 
      apiRequest("/doctor/update-profile-image", "PATCH", formData),
    
    // Fix the updateAvailability method to match the backend route
    updateAvailability: (doctorId: string, data: {
      available_time_slots: Array<{
        day: string;
        times: Array<{
          time: string;
          status: "available" | "booked";
        }>;
      }>;
    }) => apiRequest(`/doctor/time-slots/${doctorId}`, "PATCH", data),
    
    toggleStatus: (doctorId: string, status: 'active' | 'inactive') => 
      apiRequest(`/doctor/toggle-status/${doctorId}`, "PATCH", { status })
  },
  
  // Patient endpoints
  patients: {
    createProfile: (formData: FormData) => 
      apiRequest("/patient/create-profile", "POST", formData),
    
    getProfile: () => apiRequest("/patient/profile"),
    
    getById: (id: string) => apiRequest(`/patient/profile/${id}`),
    
    updateProfile: (data: any) => apiRequest("/patient/update", "PATCH", data),
    
    updateProfileImage: (formData: FormData) => 
      apiRequest("/patient/update-image", "PATCH", formData),
    
    deleteProfile: () => apiRequest("/patient/delete-profile", "DELETE")
  },
  
  // Appointments endpoints
  appointments: {
    create: (appointmentData: {
      doctorId: string;
      patientId: string;
      date: string;
      time: string;
      consultationType: string;
      reason?: string;
    }) => apiRequest("/appointment", "POST", appointmentData),
    
    getById: (id: string) => apiRequest(`/appointment/${id}`),
    
    // Updated to use the new route pattern
    getPatientAppointments: (patientId: string) => 
      apiRequest(`/appointment/patient/${patientId}`),
    
    getDoctorAppointments: (doctorId: string) => 
      apiRequest(`/appointment/doctor/${doctorId}`),
    
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
  },
  
  // OpenAI API
  openai: {
    generateResponse: async (message: string) => {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer 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`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful medical assistant. Provide concise and accurate information about medical conditions, symptoms, and appropriate specialists to consult. Do not provide specific medical diagnoses or treatment recommendations.'
              },
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 300,
            temperature: 0.7
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('OpenAI API error:', errorData);
          throw new Error(errorData.error?.message || 'Failed to get response from AI');
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error('OpenAI request failed:', error);
        throw error;
      }
    }
  }
};
