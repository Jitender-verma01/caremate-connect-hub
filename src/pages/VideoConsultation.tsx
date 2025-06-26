
import { useAuth } from "@/contexts/AuthContext";
import { DoctorVideoConsultation } from "@/components/consultation/DoctorVideoConsultation";
import { PatientVideoConsultation } from "@/components/consultation/PatientVideoConsultation";
import { useAppointment } from "@/hooks/useAppointments";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const VideoConsultation = () => {
  const { user } = useAuth();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [appointment, setAppointment] = useState<any>(null);
  useEffect(() => {
    const fetchAppointment = async () => {
      if (appointmentId) {
        const res = await api.appointments.getById(appointmentId);
        setAppointment(res.data); // contains populated `doctorId.user_id` etc.
      }
    };
    fetchAppointment();
  }, [appointmentId]);
  
  console.log('Appointment data:', appointment);

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <div>Loading consultation...</div>
  //     </div>
  //   );
  // }

  if (!appointment || !user) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading Appointment...</span>
      </div>
    );
  }

  // Determine user role based on appointment data
  const isDoctor = user.id === appointment.doctorId.user_id._id;

  
  console.log('User ID:', user.id);
  console.log('Doctor User ID:', appointment.doctorId?.user_id?._id);
  console.log('Patient User ID:', appointment.patientId?.user_id?._id);
  console.log('Is Doctor:', isDoctor);

  if (isDoctor) {
    return <DoctorVideoConsultation PatientUserId={appointment.patientId?.user_id?._id} />;
  } else {
    return <PatientVideoConsultation />;
  }
};

export default VideoConsultation;
