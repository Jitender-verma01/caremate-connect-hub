
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface Appointment {
  _id: string;
  doctorId: {
    _id: string;
    user_id: {
      name: string;
    };
    specialization: string;
    profileImage: string;
  };
  patientId: {
    _id: string;
    user_id: {
      name: string;
    };
  };
  roomId: string;
  appointmentDate: string;
  timeSlot: {
    day: string;
    time: string;
  };
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// Simplified appointment type for frontend use
export interface SimplifiedAppointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage: string;
  patientId: string;
  patientName: string;
  roomId: string;
  date: string;
  time: string;
  day: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

const transformAppointment = (appointment: Appointment): SimplifiedAppointment => {
  return {
    id: appointment._id,
    doctorId: appointment.doctorId._id,
    doctorName: appointment.doctorId.user_id.name,
    doctorSpecialty: appointment.doctorId.specialization,
    doctorImage: appointment.doctorId.profileImage || '/placeholder.svg',
    patientId: appointment.patientId._id,
    patientName: appointment.patientId.user_id.name,
    roomId: appointment.roomId,
    date: new Date(appointment.appointmentDate).toISOString().split('T')[0],
    time: appointment.timeSlot.time,
    day: appointment.timeSlot.day,
    reason: appointment.reason,
    status: appointment.status,
    createdAt: appointment.createdAt
  };
};

export const usePatientAppointments = (patientId: string) => {
  return useQuery({
    queryKey: ['patientAppointments', patientId],
    queryFn: async () => {
      const data = await api.appointments.getPatientAppointments(patientId);
      return Array.isArray(data.data) 
        ? data.data.map(transformAppointment)
        : [];
    },
    enabled: !!patientId
  });
};

export const useDoctorAppointments = (doctorId: string) => {
  return useQuery({
    queryKey: ['doctorAppointments', doctorId],
    queryFn: async () => {
      const data = await api.appointments.getDoctorAppointments(doctorId);
      return Array.isArray(data.data) 
        ? data.data.map(transformAppointment)
        : [];
    },
    enabled: !!doctorId
  });
};

export const useAppointment = (id: string) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const data = await api.appointments.getById(id);
      return data.data ? transformAppointment(data.data) : null;
    },
    enabled: !!id,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (appointmentData: {
      doctorId: string;
      date: string;
      time: string;
      consultationType: string;
      reason?: string;
    }) => {
      // Get patientId from the user profile
      const patientResponse = await api.patients.getProfile();
      
      if (!patientResponse.data) {
        throw new Error("Patient profile not found. Please complete your profile first.");
      }
      
      // Create appointment with required data
      const response = await api.appointments.create({
        ...appointmentData,
        patientId: patientResponse.data._id,
        reason: appointmentData.reason || "General consultation"
      });
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
      toast.success('Appointment booked successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to book appointment');
      console.error('Appointment booking failed:', error);
    }
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.appointments.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
      toast.success('Appointment cancelled successfully');
    },
    onError: (error) => {
      toast.error('Failed to cancel appointment');
      console.error('Appointment cancellation failed:', error);
    }
  });
};

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      api.appointments.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
      toast.success('Appointment status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update appointment status');
      console.error('Appointment status update failed:', error);
    }
  });
};
