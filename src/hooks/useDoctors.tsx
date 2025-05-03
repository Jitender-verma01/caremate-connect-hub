
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
          
          // Transform API response to match our frontend format
          return (Array.isArray(response.data) ? response.data : [response.data]).map((doctor: any) => ({
            id: doctor._id,
            name: doctor.user_id?.name || "Unknown",
            specialty: doctor.specialization,
            image: doctor.profileImage || "/placeholder.svg",
            experience: doctor.experience || 0,
            fee: doctor.fees || 0,
            rating: 4.7, // Default rating since the backend doesn't provide this yet
            reviewCount: Math.floor(Math.random() * 100) + 20, // Random review count for demo
          }));
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
          
          // Transform API response to match our frontend format
          return (Array.isArray(response.data) ? response.data : [response.data]).map((doctor: any) => ({
            id: doctor._id,
            name: doctor.user_id?.name || "Unknown",
            specialty: doctor.specialization,
            image: doctor.profileImage || "/placeholder.svg",
            experience: doctor.experience || 0,
            fee: doctor.fees || 0,
            rating: 4.7, // Default rating since the backend doesn't provide this yet
            reviewCount: Math.floor(Math.random() * 100) + 20, // Random review count for demo
          }));
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
        return {
          id: doctor._id,
          name: doctor.user_id?.name || "Unknown",
          specialty: doctor.specialization,
          image: doctor.profileImage || "/placeholder.svg",
          experience: doctor.experience || 0,
          fee: doctor.fees || 0,
          rating: 4.7, // Default rating since the backend doesn't provide this yet
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
