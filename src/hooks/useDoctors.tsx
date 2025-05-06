
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Types
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  experience: number;
  fee: number;
  rating?: number;
  reviewCount?: number;
  available_time_slots?: Array<{
    day: string;
    times: Array<{
      time: string;
      status: "available" | "booked";
    }>;
  }>;
}

interface GetDoctorsParams {
  specialization?: string;
  name?: string;
  experience?: number;
}

// Hook to fetch doctors with optional filters
export const useDoctors = (params: GetDoctorsParams = {}) => {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: async () => {
      try {
        console.log("Fetching doctors with params:", params);
        
        // If specialization is provided and not "all", use the specialization endpoint
        if (params.specialization && params.specialization !== "all") {
          console.log(`Using specialization endpoint for: ${params.specialization}`);
          const response = await api.doctors.getBySpecialization(params.specialization);
          
          if (!response?.data) {
            console.log("No data returned from specialization endpoint");
            return [];
          }
          
          console.log("Raw response from specialization endpoint:", response.data);
          
          // Transform API response to match our frontend format
          return (Array.isArray(response.data) ? response.data : [response.data]).map((doctor: any) => {
            console.log("Processing doctor data:", doctor);
            return {
              id: doctor._id || "unknown-id",
              name: doctor.name || "Unknown Doctor",
              specialty: doctor.specialization || "General",
              image: doctor.profileImage || "/placeholder.svg",
              experience: doctor.experience || 0,
              fee: doctor.fees || 0,
              rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
              reviewCount: Math.floor(Math.random() * 100) + 20, // Random review count for demo
            };
          });
        } else {
          // Use the getAll endpoint with any provided filters
          console.log("Using getAll endpoint with filters");
          const response = await api.doctors.getAll({
            specialization: params.specialization === "all" ? undefined : params.specialization,
            name: params.name,
            experience: params.experience
          });
          
          if (!response?.data) {
            console.log("No data returned from getAll endpoint");
            return [];
          }
          
          console.log("Raw response from getAll endpoint:", response.data);
          
          // Transform API response to match our frontend format
          return (Array.isArray(response.data) ? response.data : [response.data]).map((doctor: any) => {
            // Log the full doctor object for debugging
            console.log("Processing doctor:", JSON.stringify(doctor, null, 2));
            
            // Check if user_id is null or undefined
            let doctorName = "Unknown Doctor";
            if (doctor.user_id && typeof doctor.user_id === 'object' && doctor.user_id.name) {
              doctorName = doctor.user_id.name;
            } else if (typeof doctor.user_id === 'string') {
              doctorName = "Dr. " + doctor._id.substring(0, 5);
            }

            return {
              id: doctor._id || "unknown-id",
              name: doctorName,
              specialty: doctor.specialization || "General",
              image: doctor.profileImage || "/placeholder.svg",
              experience: doctor.experience || 0,
              fee: doctor.fees || 0,
              rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
              reviewCount: Math.floor(Math.random() * 100) + 20, // Random review count for demo
            };
          });
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 60000, // 1 minute
  });
};

// Hook to fetch a single doctor by ID
export const useDoctor = (id: string) => {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => {
      try {
        const response = await api.doctors.getById(id);
        if (!response?.data) {
          throw new Error("Doctor not found");
        }
        
        const doctor = response.data;
        console.log("Single doctor data:", JSON.stringify(doctor, null, 2));
        
        // Extract doctor name from user_id object if it exists
        let doctorName = "Unknown Doctor";
        if (doctor.user_id && typeof doctor.user_id === 'object' && doctor.user_id.name) {
          doctorName = doctor.user_id.name;
        } else if (typeof doctor.user_id === 'string') {
          doctorName = "Dr. " + doctor._id.substring(0, 5);
        }
        
        return {
          id: doctor._id || "unknown-id",
          name: doctorName,
          specialty: doctor.specialization || "General",
          image: doctor.profileImage || "/placeholder.svg",
          experience: doctor.experience || 0,
          fee: doctor.fees || 0,
          rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
          reviewCount: Math.floor(Math.random() * 100) + 20, // Random review count for demo
        };
      } catch (error) {
        console.error("Error fetching doctor:", error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

// Hook to fetch availability for a specific doctor on a specific date
export const useDoctorAvailability = (doctorId: string, date: string) => {
  return useQuery({
    queryKey: ["doctor", doctorId, "availability", date],
    queryFn: async () => {
      if (!doctorId || !date) return null;
      
      try {
        const response = await api.doctors.getAvailability(doctorId, date);
        return response?.data || null;
      } catch (error) {
        console.error("Error fetching doctor availability:", error);
        throw error;
      }
    },
    enabled: !!doctorId && !!date,
  });
};
