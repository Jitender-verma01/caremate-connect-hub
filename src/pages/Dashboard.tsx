
import { useAuth } from '@/contexts/AuthContext';
import { MyAppointments } from '@/components/patient/MyAppointments';
import { FindDoctorByAvailability } from '@/components/patient/FindDoctorByAvailability';
import { AppointmentManagement } from '@/components/doctor/AppointmentManagement';
import { AvailabilityManagement } from '@/components/doctor/AvailabilityManagement';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Initialize real-time notifications
  useRealTimeNotifications();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {user?.role === 'patient' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MyAppointments />
          <FindDoctorByAvailability />
        </div>
      )}
      
      {user?.role === 'doctor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AppointmentManagement />
          <AvailabilityManagement />
        </div>
      )}
      
      {!user && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            Please log in to view your dashboard.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
