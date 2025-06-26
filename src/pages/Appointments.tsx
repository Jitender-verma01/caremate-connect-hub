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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, VideoIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { useDoctorAppointments } from "@/hooks/useAppointments";
const Appointments = () => {
  const { user } = useAuth();

  const { data: doctorProfile, isLoading: doctorLoading } = useQuery({
    queryKey: ['doctor', user?.id],
    queryFn: () => api.doctors.getProfile().then(res => res.data),
    enabled: !!user?.id,
  });
  console.log("doctorProfile", doctorProfile);
  console.log("doctorProfile ID:", doctorProfile?._id);

  const { data = [], isLoading } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: async () => {
      const res = await api.appointments.getDoctorAppointments(doctorProfile?._id || user?.id);
      return res.data || [];
    },
    enabled: !!user?.id,
  });
  console.log("data", data);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Appointments</h1>
        <p className="text-muted-foreground">Here's a list of all your appointments</p>
      </div>

      {isLoading ? (
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
      ) : data.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No appointments found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((appointment: any) => (
            <Card key={appointment.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {appointment.patientId.user_id.name || "Unknown Patient"}
                </CardTitle>
                <CardDescription>
                  {appointment.consultationType || "Consultation"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarClock className="h-4 w-4" />
                  {format(new Date(appointment.appointmentDate), "dd MMM yyyy")} @ {appointment.timeSlot}
                </div>
                <p className="text-sm text-muted-foreground">Reason: {appointment.reason}</p>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
