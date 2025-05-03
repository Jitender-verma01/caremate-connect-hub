import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface Doctor {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  specialization: string;
  fees: number;
  qualification: string;
  experience: number;
  profileImage: string;
  status: 'active' | 'inactive';
  available_time_slots: Array<{
    day: string;
    times: Array<{
      time: string;
      status: 'available' | 'booked';
    }>;
  }>;
}

// Enriched doctor type with calculated/normalized properties
export interface EnrichedDoctor {
  id: string;
  userId: string;
  name: string;
  email: string;
  specialty: string;
  image: string;
  qualification: string;
  experience: number;
  fee: number;
  status: 'active' | 'inactive';
  consultationTypes: string[];
  availableTimeSlots?: {
    [key: string]: string[];
  };
}

// Transform API doctor to frontend format
const transformDoctor = (apiDoctor: Doctor): EnrichedDoctor => {
  return {
    id: apiDoctor._id,
    userId: apiDoctor.user_id._id,
    name: apiDoctor.user_id.name,
    email: apiDoctor.user_id.email,
    specialty: apiDoctor.specialization,
    image: apiDoctor.profileImage || '/placeholder.svg',
    qualification: apiDoctor.qualification,
    experience: apiDoctor.experience,
    fee: apiDoctor.fees,
    status: apiDoctor.status,
    consultationTypes: ['Video Consultation', 'In-person Consultation'],
  };
};

export const useDoctors = (searchParams?: { specialization?: string; name?: string; experience?: number }) => {
  return useQuery({
    queryKey: ['doctors', searchParams],
    queryFn: async () => {
      try {
        // Use proper API params format
        const queryParams: any = {};
        
        // Only add specialization if it's defined and not 'all'
        if (searchParams?.specialization && searchParams.specialization !== 'all') {
          queryParams.specialization = searchParams.specialization;
        }
        
        if (searchParams?.name) {
          queryParams.name = searchParams.name;
        }
        
        if (searchParams?.experience) {
          queryParams.experience = searchParams.experience;
        }
        
        console.log("Fetching doctors with params:", queryParams);
        const data = await api.doctors.getAll(queryParams);
        console.log("Received doctor data:", data);
        
        // Handle different response formats from backend
        if (data?.data) {
          // If data is an array, map through it
          if (Array.isArray(data.data)) {
            return data.data.map(transformDoctor);
          }
          // If data has a doctors property that is an array
          else if (Array.isArray(data.data.doctors)) {
            return data.data.doctors.map(transformDoctor);
          }
          // If data is a single object
          else if (typeof data.data === 'object') {
            return [transformDoctor(data.data)];
          }
        }
        
        // Return an empty array if no doctors found or unable to parse response
        console.log("No doctors found in response:", data);
        return [];
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to load doctors. Please try again.");
        throw error;
      }
    },
    staleTime: 60000, // 1 minute
  });
};

export const useDoctor = (id: string) => {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      try {
        const data = await api.doctors.getById(id);
        return data?.data ? transformDoctor(data.data) : null;
      } catch (error) {
        console.error("Error fetching doctor:", error);
        return null;
      }
    },
    enabled: !!id,
  });
};

export const useDoctorAvailability = (id: string, date: string) => {
  return useQuery({
    queryKey: ['doctorAvailability', id, date],
    queryFn: async () => {
      try {
        const data = await api.doctors.getAvailability(id, date);
        
        // Handle different response formats
        if (data?.data) {
          // If the response is already in the format we need
          if (typeof data.data === 'object' && !Array.isArray(data.data)) {
            return data.data;
          }
          
          // If the response is an array of available time slots
          else if (Array.isArray(data.data)) {
            // Convert the array into our frontend format
            const availabilityByPeriod: {[key: string]: string[]} = {
              morning: [],
              afternoon: [],
              evening: []
            };
            
            data.data.forEach(slot => {
              const availableTimes = slot.times
                .filter((time: any) => time.status === 'available')
                .map((time: any) => time.time);
              
              availableTimes.forEach((time: string) => {
                const hour = parseInt(time.split(':')[0]);
                if (hour < 12) {
                  availabilityByPeriod.morning.push(time);
                } else if (hour < 17) {
                  availabilityByPeriod.afternoon.push(time);
                } else {
                  availabilityByPeriod.evening.push(time);
                }
              });
            });
            
            return availabilityByPeriod;
          }
        }
        
        // Return empty availability if nothing could be parsed
        return {
          morning: [],
          afternoon: [],
          evening: []
        };
      } catch (error) {
        console.error("Error fetching doctor availability:", error);
        // Return empty availability on error
        return {
          morning: [],
          afternoon: [],
          evening: []
        };
      }
    },
    enabled: !!id && !!date,
  });
};
