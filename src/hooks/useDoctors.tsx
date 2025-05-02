
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

// Mock data for doctors when the API fails
const MOCK_DOCTORS: EnrichedDoctor[] = [
  {
    id: "doctor1",
    userId: "user1",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@example.com",
    specialty: "Cardiology",
    image: "/placeholder.svg",
    qualification: "MD, Cardiology",
    experience: 8,
    fee: 120,
    status: 'active',
    consultationTypes: ['Video Consultation', 'In-person Consultation'],
  },
  {
    id: "doctor2",
    userId: "user2",
    name: "Dr. Michael Chen",
    email: "michael.chen@example.com",
    specialty: "Neurology",
    image: "/placeholder.svg",
    qualification: "MD, Neurology",
    experience: 12,
    fee: 150,
    status: 'active',
    consultationTypes: ['Video Consultation', 'In-person Consultation'],
  },
  {
    id: "doctor3",
    userId: "user3",
    name: "Dr. Amelia Rodriguez",
    email: "amelia.rodriguez@example.com",
    specialty: "Pediatrics",
    image: "/placeholder.svg",
    qualification: "MD, Pediatrics",
    experience: 5,
    fee: 100,
    status: 'active',
    consultationTypes: ['Video Consultation'],
  }
];

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
        const data = await api.doctors.getAll(searchParams);
        return Array.isArray(data.data) 
          ? data.data.map(transformDoctor)
          : [];
      } catch (error) {
        console.error("Error fetching doctors:", error);
        
        // Filter mock doctors if specialization is provided
        if (searchParams?.specialization) {
          return MOCK_DOCTORS.filter(doctor => 
            doctor.specialty === searchParams.specialization
          );
        }
        
        // Return all mock doctors if no filter or if filter failed
        return MOCK_DOCTORS;
      }
    },
  });
};

export const useDoctor = (id: string) => {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      try {
        const data = await api.doctors.getById(id);
        return data.data ? transformDoctor(data.data) : null;
      } catch (error) {
        console.error("Error fetching doctor:", error);
        return MOCK_DOCTORS.find(doctor => doctor.id === id) || null;
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
        return data.data || null;
      } catch (error) {
        console.error("Error fetching doctor availability:", error);
        // Return mock availability data
        return {
          morning: ["09:00 AM", "10:00 AM", "11:00 AM"],
          afternoon: ["01:00 PM", "02:00 PM", "03:00 PM"],
          evening: ["05:00 PM", "06:00 PM"]
        };
      }
    },
    enabled: !!id && !!date,
  });
};
