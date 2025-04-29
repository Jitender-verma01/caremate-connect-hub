
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

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
      const data = await api.doctors.getAll(searchParams);
      return Array.isArray(data.data) 
        ? data.data.map(transformDoctor)
        : [];
    },
  });
};

export const useDoctor = (id: string) => {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const data = await api.doctors.getById(id);
      return data.data ? transformDoctor(data.data) : null;
    },
    enabled: !!id,
  });
};

export const useDoctorAvailability = (id: string, date: string) => {
  return useQuery({
    queryKey: ['doctorAvailability', id, date],
    queryFn: async () => {
      const data = await api.doctors.getAvailability(id, date);
      return data.data || null;
    },
    enabled: !!id && !!date,
  });
};
