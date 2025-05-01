
import { useAuth } from '@/contexts/AuthContext';
import { MyAppointments } from '@/components/patient/MyAppointments';
import { FindDoctorByAvailability } from '@/components/patient/FindDoctorByAvailability';
import { AppointmentManagement } from '@/components/doctor/AppointmentManagement';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, Users, Activity, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalPatients: 0,
    completionRate: 0
  });
  
  // Initialize real-time notifications
  useRealTimeNotifications();

  // Simulate fetching stats for doctor
  useEffect(() => {
    if (user?.role === 'doctor') {
      // This would normally be an API call
      setStats({
        totalAppointments: Math.floor(Math.random() * 100) + 50,
        upcomingAppointments: Math.floor(Math.random() * 15) + 5,
        totalPatients: Math.floor(Math.random() * 50) + 20,
        completionRate: Math.floor(Math.random() * 30) + 70
      });
    }
  }, [user]);
  
  const StatCard = ({ icon: Icon, title, value, description, colorClass }) => (
    <Card className="overflow-hidden">
      <CardHeader className={`${colorClass} text-white flex flex-row items-center justify-between space-y-0 pb-2`}>
        <CardTitle className="text-md font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-white" />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome, {user?.name || 'User'}</h1>
      </div>
      
      {user?.role === 'patient' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">My Appointments</h2>
            <Card className="bg-gradient-to-br from-care-light to-white border-care-primary/20">
              <CardContent className="p-0">
                <MyAppointments />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Find a Doctor</h2>
            <Card className="bg-gradient-to-br from-care-light to-white border-care-primary/20">
              <CardContent className="p-0">
                <FindDoctorByAvailability />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {user?.role === 'doctor' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon={CalendarClock} 
              title="Total Appointments" 
              value={stats.totalAppointments} 
              description="All-time appointments" 
              colorClass="bg-care-primary"
            />
            <StatCard 
              icon={Activity} 
              title="Upcoming" 
              value={stats.upcomingAppointments} 
              description="Scheduled appointments" 
              colorClass="bg-care-secondary"
            />
            <StatCard 
              icon={Users} 
              title="Patients" 
              value={stats.totalPatients} 
              description="Patients treated" 
              colorClass="bg-care-dark"
            />
            <StatCard 
              icon={Heart} 
              title="Completion Rate" 
              value={`${stats.completionRate}%`} 
              description="Appointment completion" 
              colorClass="bg-care-accent"
            />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Appointment Management</h2>
            <Card className="bg-gradient-to-br from-care-light to-white border-care-primary/20">
              <CardContent className="p-0">
                <AppointmentManagement />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Patient Activity</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-4 pb-4 border-b last:border-none last:pb-0">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-care-light to-care-primary flex items-center justify-center text-white font-bold">
                          {String.fromCharCode(65 + i)}
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">Patient {String.fromCharCode(65 + i)}</p>
                        <p className="text-sm text-muted-foreground">
                          {i === 0 ? "Booked a new appointment" : 
                           i === 1 ? "Updated medical information" : 
                           "Requested prescription refill"}
                        </p>
                        <p className="text-xs text-muted-foreground">{i + 1} hour{i !== 0 ? 's' : ''} ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50">
                <p className="text-xs text-muted-foreground">
                  Patient activity is updated in real-time
                </p>
              </CardFooter>
            </Card>
          </div>
        </>
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
