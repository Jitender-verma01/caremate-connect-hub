
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  bio?: string;
  experience?: number;
  fee: number;
  rating?: number;
  consultationTypes: string[];
  availableTimeSlots?: {
    [key: string]: string[];
  };
}

export const useDoctors = (searchParams?: { specialty?: string; name?: string }) => {
  return useQuery({
    queryKey: ['doctors', searchParams],
    queryFn: () => api.doctors.getAll(searchParams),
  });
};

export const useDoctor = (id: string) => {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: () => api.doctors.getById(id),
    enabled: !!id,
  });
};

export const useDoctorAvailability = (id: string, date: string) => {
  return useQuery({
    queryKey: ['doctorAvailability', id, date],
    queryFn: () => api.doctors.getAvailability(id, date),
    enabled: !!id && !!date,
  });
};
