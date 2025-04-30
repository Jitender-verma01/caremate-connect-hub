
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

// Types
interface Appointment {
  id: string;
  doctorId: string;
  doctorName?: string;
  doctorSpecialty?: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "canceled";
  consultationType: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

interface GetAppointmentsResponse {
  appointments: Appointment[];
}

interface BookAppointmentParams {
  doctorId: string;
  date: string;
  time: string;
  consultationType: string;
  reason?: string;
}

// Get appointments for the current user (patient)
export const usePatientAppointments = () => {
  return useQuery({
    queryKey: ["appointments", "patient"],
    queryFn: async () => {
      const response = await api.appointments.getPatientAppointments("current");
      return response as GetAppointmentsResponse;
    },
  });
};

// Get appointments for a specific doctor
export const useDoctorAppointments = (doctorId: string) => {
  return useQuery({
    queryKey: ["appointments", "doctor", doctorId],
    queryFn: async () => {
      const response = await api.appointments.getDoctorAppointments(doctorId);
      return response as GetAppointmentsResponse;
    },
    enabled: !!doctorId,
  });
};

// Get a single appointment by ID
export const useAppointment = (id: string) => {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: async () => {
      const response = await api.appointments.getById(id);
      return response as Appointment;
    },
    enabled: !!id,
  });
};

// Book a new appointment
export const useBookAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (appointment: BookAppointmentParams) => {
      return api.appointments.create(appointment);
    },
    onSuccess: () => {
      toast.success("Appointment booked successfully!");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error) => {
      toast.error(`Failed to book appointment: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });
};

// Cancel an appointment
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (appointmentId: string) => {
      return api.appointments.cancel(appointmentId);
    },
    onSuccess: () => {
      toast.success("Appointment canceled successfully");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error) => {
      toast.error(`Failed to cancel appointment: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });
};

// Update appointment status
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      return api.appointments.updateStatus(id, status);
    },
    onSuccess: () => {
      toast.success("Appointment status updated");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });
};
