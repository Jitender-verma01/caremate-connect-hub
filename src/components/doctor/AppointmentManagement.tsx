
import React from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useDoctorAppointments, useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, VideoIcon, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export function AppointmentManagement() {
  const { user } = useAuth();
  console.log("user", user);
  const { data: doctorProfile, isLoading: doctorLoading } = useQuery({
    queryKey: ['doctor', user?.id],
    queryFn: () => api.doctors.getProfile().then(res => res.data),
    enabled: !!user?.id,
  });
  console.log("doctorProfile", doctorProfile);
  console.log("doctorProfile ID:", doctorProfile?._id);


  const { data, isLoading, error } = useDoctorAppointments(doctorProfile?._id || '');
  console.log("data", data);
  const updateStatus = useUpdateAppointmentStatus();
  
  if (isLoading) {
     return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading Appointment...</span>
      </div>
    );
  }
  
  if (error) {
    return <div>Error loading appointments: {error.message}</div>;
  }
  
  const appointments = data?.appointments || [];
  console.log("Appointments:", appointments);
  
  const todayAppointments = appointments.filter(
    app => format(new Date(app.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );
  
  const upcomingAppointments = appointments.filter(
    app => 
      new Date(app.date) > new Date() && 
      format(new Date(app.date), 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') &&
      app.status === 'scheduled'
  );
  
  const pastAppointments = appointments.filter(
    app => new Date(app.date) < new Date() || app.status === 'completed' || app.status === 'canceled'
  );

  const markAsCompleted = (appointmentId: string) => {
    updateStatus.mutate({ id: appointmentId, status: 'completed' });
  };

  const renderAppointmentCard = (appointment: any) => (
    <Card key={appointment.id} className="mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            <span className="font-medium">{appointment.patientName || 'Patient'}</span>
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
          <div className="flex items-center">
            <VideoIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{appointment.consultationType}</span>
          </div>
          {appointment.reason && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">Reason:</p>
              <p className="text-sm">{appointment.reason}</p>
            </div>
          )}
        </div>

        <div className="mt-4 space-x-2 flex">
          {appointment.status === 'scheduled' && (
            <>
              <Button 
                variant="default" 
                size="sm" 
                asChild
                className="flex-1"
              >
                <Link to={`/consultation/${appointment.id}`}>
                  Start Session
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => markAsCompleted(appointment.id)}
              >
                Mark Complete
              </Button>
            </>
          )}
          {appointment.status === 'completed' && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
              asChild
            >
              <Link to={`/prescriptions?appointmentId=${appointment.id}`}>
                View/Create Prescription
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today">
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
              <p className="text-muted-foreground text-center py-8">No appointments scheduled for today.</p>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map(renderAppointmentCard)
            ) : (
              <p className="text-muted-foreground text-center py-8">No upcoming appointments.</p>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length > 0 ? (
              pastAppointments.map(renderAppointmentCard)
            ) : (
              <p className="text-muted-foreground text-center py-8">No past appointments.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
