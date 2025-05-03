
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { usePatientAppointments } from '@/hooks/useAppointments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, VideoIcon, Check, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function AppointmentSummary() {
  const { data, isLoading, error } = usePatientAppointments();
  const navigate = useNavigate();

  const appointments = data?.appointments || [];
  
  const upcomingAppointments = appointments
    .filter(app => new Date(app.date) > new Date() && app.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3); // Show only next 3 appointments
  
  const todayAppointments = appointments.filter(
    app => format(new Date(app.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  const handleJoinConsultation = (appointmentId: string) => {
    navigate(`/consultation/${appointmentId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <X className="mx-auto h-8 w-8 text-destructive mb-2" />
          <p className="text-sm text-muted-foreground mb-4">
            Unable to load your appointments
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/book-appointment')}>
            Book New Appointment
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasUpcoming = upcomingAppointments.length > 0;
  const hasToday = todayAppointments.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {hasToday && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Badge className="mr-2">Today</Badge> 
              Your Scheduled Appointments
            </h3>
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="bg-muted p-2 rounded-md">
                      <Clock className="h-5 w-5 text-care-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Dr. {appointment.doctorName}</p>
                      <div className="text-sm text-muted-foreground">
                        Today at {appointment.time}
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleJoinConsultation(appointment.id)}
                  >
                    <VideoIcon className="mr-1 h-4 w-4" />
                    Join
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {hasUpcoming ? (
          <div className="space-y-4">
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Calendar className="mr-2 h-4 w-4" /> 
              Upcoming Appointments
            </h3>
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="bg-muted p-2 rounded-md">
                    <Calendar className="h-5 w-5 text-care-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Dr. {appointment.doctorName}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>{format(new Date(appointment.date), 'MMM d')}</span>
                      <span className="mx-1">•</span>
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline">{appointment.consultationType}</Badge>
              </div>
            ))}
            
            <div className="pt-2 text-right">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
              >
                View All Appointments
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              No upcoming appointments scheduled
            </p>
            <Button onClick={() => navigate('/doctors')}>
              Book an Appointment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
