import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, VideoIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { useDoctorAppointments } from "@/hooks/useAppointments";
import { usePatientAppointments, useCancelAppointment } from '@/hooks/useAppointments';

const Appointments = () => {
  const { user } = useAuth();

  const { data: doctorProfile, isLoading: doctorLoading } = useQuery({
    queryKey: ['doctor', user?.id],
    queryFn: () => api.doctors.getProfile().then(res => res.data),
    enabled: !!user?.id,
  });
  console.log("doctorProfile", doctorProfile);
  console.log("doctorProfile ID:", doctorProfile?._id);

  const isDoctor = user?.role === "doctor";
  console.log("Is user a doctor?", isDoctor);

  const {
    data: patientAppointmentsData,
    isLoading,
    refetch,
  } = usePatientAppointments();
  console.log("Patient appointments data:", patientAppointmentsData);
  
  const {
    data: doctorAppointments = [],
    isLoading: doctorAppointmentsLoading,
  } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: async () => {
      const res = await api.appointments.getDoctorAppointments(doctorProfile?._id);
      return res.data || [];
    },
    enabled: !!user?.id && isDoctor,
  });
  
  const appointments = isDoctor
    ? doctorAppointments
    : Array.isArray(patientAppointmentsData?.appointments)
      ? patientAppointmentsData.appointments
      : [];
  
      const groupedAppointments = {
        scheduled: appointments.filter((a) => a.status === "scheduled"),
        completed: appointments.filter((a) => a.status === "completed"),
        cancelled: appointments.filter((a) => a.status === "cancelled"),
      };

      const renderAppointmentsSection = (title: string, list: any[]) => {
        if (list.length === 0) return null;
      
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mt-6 mb-2">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {list.map((appointment: any) => (
                <Card key={appointment.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {isDoctor
                        ? appointment.patientId?.user_id?.name || "Unknown Patient"
                        : `Dr. ${appointment.doctorName || "Unknown Doctor"}`}
                    </CardTitle>
                    <CardDescription>
                      {appointment.consultationType || appointment.doctorSpecialty}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarClock className="h-4 w-4" />
                      {appointment.appointmentDate || appointment.date ? (
                        <>
                          {format(
                            new Date(
                              appointment.appointmentDate || appointment.date
                            ),
                            "dd MMM yyyy"
                          )}
                          {appointment.timeSlot && ` @ ${appointment.timeSlot}`}
                        </>
                      ) : (
                        "Unknown Date"
                      )}
                    </div>
                    {appointment.reason && (
                      <p className="text-sm text-muted-foreground">
                        Reason: {appointment.reason}
                      </p>
                    )}
                    <Badge
                      variant="outline"
                      className={`capitalize ${
                        appointment.status === "completed"
                          ? "text-green-600 border-green-400"
                          : appointment.status === "cancelled"
                          ? "text-red-600 border-red-400"
                          : ""
                      }`}
                    >
                      {appointment.status}
                    </Badge>
      
                    {user?.role === "patient" &&
                      appointment.status === "scheduled" && (
                        <button
                          onClick={async () => {
                            try {
                              await cancelAppointment.mutateAsync(appointment.id);
                              refetch();
                            } catch (err) {
                              console.error("Cancel failed", err);
                            }
                          }}
                          className="text-sm text-red-600 border border-red-400 rounded px-2 py-1 mt-2 hover:bg-red-50 transition"
                        >
                          Cancel Appointment
                        </button>
                      )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      };
      

  const cancelAppointment = useCancelAppointment();

  console.log("Final appointments list:", appointments);


  const handleCancel = async (appointmentId: string) => {
    try {
      await cancelAppointment.mutateAsync(appointmentId);
      refetch();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Appointments</h1>
        <p className="text-muted-foreground">Here's a list of all your appointments</p>
      </div>

      {(isLoading || doctorAppointmentsLoading) ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No appointments found</p>
          </div>
        ) : (
          <>
            <Tabs defaultValue="scheduled" className="w-full">
              <TabsList>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>

              <TabsContent value="scheduled">
                {renderAppointmentsSection("Scheduled", groupedAppointments.scheduled)}
              </TabsContent>

              <TabsContent value="completed">
                {renderAppointmentsSection("Completed", groupedAppointments.completed)}
              </TabsContent>

              <TabsContent value="cancelled">
                {renderAppointmentsSection("Cancelled", groupedAppointments.cancelled)}
              </TabsContent>
            </Tabs>

          </>
        )}

    </div>
  );
};



export default Appointments;
