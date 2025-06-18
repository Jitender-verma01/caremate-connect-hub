
import { useAuth } from "@/contexts/AuthContext";
import { DoctorVideoConsultation } from "@/components/consultation/DoctorVideoConsultation";
import { PatientVideoConsultation } from "@/components/consultation/PatientVideoConsultation";
import { useAppointment } from "@/hooks/useAppointments";
import { useParams } from "react-router-dom";

const VideoConsultation = () => {
  const { user } = useAuth();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { data: appointment, isLoading } = useAppointment(appointmentId!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading consultation...</div>
      </div>
    );
  }

  if (!appointment || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Appointment not found or unauthorized access</div>
      </div>
    );
  }

  // Determine user role based on appointment data
  const isDoctor = user.id === appointment.doctorId;
  
  console.log('User ID:', user.id);
  console.log('Doctor ID:', appointment.doctorId);
  console.log('Patient ID:', appointment.patientId);
  console.log('Is Doctor:', isDoctor);

  if (isDoctor) {
    return <DoctorVideoConsultation />;
  } else {
    return <PatientVideoConsultation />;
  }
};

export default VideoConsultation;
