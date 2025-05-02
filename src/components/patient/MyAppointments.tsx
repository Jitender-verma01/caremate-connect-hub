
import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { usePatientAppointments, useCancelAppointment } from '@/hooks/useAppointments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  User, 
  VideoIcon, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/contexts/AuthContext';

export function MyAppointments() {
  const { data, isLoading, error, refetch } = usePatientAppointments();
  const cancelAppointment = useCancelAppointment();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Attempt to refetch if the user is logged in but we got an error
  useEffect(() => {
    if (error && user) {
      // Wait a moment before retrying to give the patient profile time to load
      const timer = setTimeout(() => {
        refetch();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [error, user, refetch]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <Clock className="mx-auto h-10 w-10 text-muted-foreground animate-pulse mb-2" />
          <p>Loading your appointments...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-2" />
          <p className="text-muted-foreground mb-4">
            {error instanceof Error 
              ? error.message === "Patient ID is required"
                ? "We're setting up your appointments. Please complete your profile if you haven't already."
                : error.message
              : "Failed to load appointments"}
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const appointments = data?.appointments || [];
  
  const upcomingAppointments = appointments.filter(
    app => new Date(app.date) > new Date() && app.status === 'scheduled'
  );
  
  const pastAppointments = appointments.filter(
    app => new Date(app.date) < new Date() || app.status === 'completed' || app.status === 'canceled'
  );
  
  const todayAppointments = appointments.filter(
    app => format(new Date(app.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  const handleCancelAppointment = (appointmentId: string) => {
    cancelAppointment.mutate(appointmentId);
  };

  const handleJoinConsultation = (appointmentId: string) => {
    navigate(`/consultation/${appointmentId}`);
  };

  const renderAppointmentCard = (appointment: any) => (
    <Card key={appointment.id} className="mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            <span className="font-medium">Dr. {appointment.doctorName || 'Unknown'}</span>
          </div>
          <Badge variant={
            appointment.status === 'scheduled' ? 'outline' : 
            appointment.status === 'completed' ? 'secondary' : 'destructive'
          }>
            {appointment.status}
          </Badge>
        </div>
        
        <div className="mt-2 space-y-1 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{format(new Date(appointment.date), 'PPP')}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{appointment.time}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {appointment.consultationType}
          </div>
        </div>

        <div className="mt-4 space-x-2 flex">
          {appointment.status === 'scheduled' && (
            <>
              {isAppointmentNow(appointment) ? (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleJoinConsultation(appointment.id)}
                >
                  <VideoIcon className="mr-2 h-4 w-4" />
                  Join Now
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 text-destructive"
                    >
                      Cancel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel appointment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. The appointment slot will be freed up for other patients.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Yes, Cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </>
          )}
          
          {appointment.status === 'completed' && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
              onClick={() => navigate(`/prescriptions?appointmentId=${appointment.id}`)}
            >
              View Prescriptions
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Helper function to determine if appointment is happening now
  function isAppointmentNow(appointment: any) {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    
    // Check if it's the same day
    const sameDay = format(appointmentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    
    if (!sameDay) return false;
    
    // Extract hours from appointment time (format: "10:00 AM")
    const [time, period] = appointment.time.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    // Convert to 24-hour format
    let appointmentHour = hours;
    if (period === 'PM' && hours < 12) appointmentHour += 12;
    if (period === 'AM' && hours === 12) appointmentHour = 0;
    
    // Get current hour
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    
    // Appointment is considered "now" if it's within 15 minutes before or 30 minutes after the scheduled time
    const appointmentTimeInMinutes = appointmentHour * 60 + minutes;
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    return (
      currentTimeInMinutes >= appointmentTimeInMinutes - 15 && 
      currentTimeInMinutes <= appointmentTimeInMinutes + 30
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4">
            <TabsTrigger value="today">
              Today <Badge variant="outline" className="ml-2">{todayAppointments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming <Badge variant="outline" className="ml-2">{upcomingAppointments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="past">
              Past <Badge variant="outline" className="ml-2">{pastAppointments.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="space-y-4">
            {todayAppointments.length > 0 ? (
              todayAppointments.map(renderAppointmentCard)
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No appointments scheduled for today.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map(renderAppointmentCard)
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No upcoming appointments scheduled.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/doctors')}
                >
                  Find Doctors
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length > 0 ? (
              pastAppointments.map(renderAppointmentCard)
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No past appointment records.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
