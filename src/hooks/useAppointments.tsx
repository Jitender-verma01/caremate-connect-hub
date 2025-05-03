
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

// Types
export interface Appointment {
  id: string;
  doctorId: string;
  doctorName?: string;
  doctorSpecialty?: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "canceled" | "cancelled";
  consultationType: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAppointmentsResponse {
  appointments: Appointment[];
  success?: boolean;
  statusCode?: number;
  message?: string;
}

export interface BookAppointmentParams {
  doctorId: string;
  date: string;
  time: string;
  consultationType: string;
  reason?: string;
}

// Get appointments for the current user (patient)
export const usePatientAppointments = () => {
  // First, get the patient profile to get the ID
  const patientProfileQuery = useQuery({
    queryKey: ["patientProfile"],
    queryFn: async () => {
      try {
        const response = await api.patients.getProfile();
        console.log("Patient profile response:", response);
        return response?.data;
      } catch (error) {
        console.error("Error fetching patient profile:", error);
        throw error;
      }
    },
  });

  // Then use that ID to fetch appointments
  return useQuery({
    queryKey: ["appointments", "patient", patientProfileQuery.data?._id],
    queryFn: async () => {
      try {
        // Check if we have the patient ID
        if (!patientProfileQuery.data?._id) {
          throw new Error("Patient profile not loaded yet");
        }
        
        const patientId = patientProfileQuery.data._id;
        console.log("Using patient ID for appointments:", patientId);
        
        // Now get appointments with patient ID
        const response = await api.appointments.getPatientAppointments(patientId);
        console.log("Appointments response:", response);
        
        // Transform API response to match our frontend format
        if (response?.data) {
          const appointments = Array.isArray(response.data) ? response.data : [];
          
          return {
            appointments: appointments.map((app: any) => ({
              id: app._id || app.id,
              doctorId: app.doctorId?._id || app.doctorId,
              doctorName: app.doctorId?.user_id?.name || "Unknown Doctor",
              doctorSpecialty: app.doctorId?.specialization || "General",
              date: app.appointmentDate || app.date,
              time: app.timeSlot?.time || app.timeSlot || app.time,
              status: app.status || "scheduled",
              consultationType: app.consultationType || "Video Consultation",
              reason: app.reason,
              createdAt: app.createdAt,
              updatedAt: app.updatedAt
            }))
          } as GetAppointmentsResponse;
        }
        
        // Return empty array if no appointments
        return { appointments: [] };
      } catch (error) {
        console.error("Error fetching appointments:", error);
        throw error;
      }
    },
    // Only run this query when we have the patient ID
    enabled: !!patientProfileQuery.data?._id,
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
};

// Get appointments for a specific doctor
export const useDoctorAppointments = (doctorId: string) => {
  return useQuery({
    queryKey: ["appointments", "doctor", doctorId],
    queryFn: async () => {
      const response = await api.appointments.getDoctorAppointments(doctorId);
      
      // Transform API response to match our frontend format
      if (response?.data) {
        const appointments = Array.isArray(response.data) ? response.data : [];
        
        return {
          appointments: appointments.map((app: any) => ({
            id: app._id || app.id,
            doctorId: app.doctorId?._id || app.doctorId,
            patientId: app.patientId?._id || app.patientId,
            patientName: app.patientId?.user_id?.name || "Unknown Patient",
            date: app.appointmentDate || app.date,
            time: app.timeSlot?.time || app.timeSlot || app.time,
            status: app.status || "scheduled",
            consultationType: app.consultationType || "Video Consultation",
            reason: app.reason,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt
          }))
        } as GetAppointmentsResponse;
      }
      
      return { appointments: [] };
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
    mutationFn: async (appointment: BookAppointmentParams) => {
      // Get patient profile to get patient ID
      const patientResponse = await api.patients.getProfile();
      
      if (!patientResponse?.data?._id) {
        throw new Error("Patient profile not found");
      }
      
      const patientId = patientResponse.data._id;
      
      // Add patientId to the appointment data
      return api.appointments.create({
        ...appointment,
        patientId
      });
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
