
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { useDoctors } from '@/hooks/useDoctors';
import { Calendar } from '@/components/ui/calendar';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton'; 
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarIcon, User, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

const SPECIALIZATIONS = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Gynecology",
  "Ophthalmology",
  "ENT",
  "Psychiatry",
  "Dental",
];

export function FindDoctorByAvailability() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [specialization, setSpecialization] = useState<string>("all");
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  
  const { data: doctors, isLoading, error, refetch } = useDoctors({
    specialization: specialization === 'all' ? undefined : specialization,
  });

  // Check if user is a doctor
  const isDoctor = user?.role === 'doctor';

  // If there's an error loading doctors, show a toast
  useEffect(() => {
    if (error) {
      toast.error("Failed to load doctors. Please try again later.");
      console.error("Doctor fetch error:", error);
    }
  }, [error]);

  const handleBookAppointment = (doctorId: string) => {
    navigate(`/book-appointment/${doctorId}?date=${formattedDate}`);
  };

  // Handle specialization change
  const handleSpecializationChange = (value: string) => {
    setSpecialization(value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Find Available Doctors</CardTitle>
        <CardDescription>Search for doctors by date and specialty</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" /> Select Date
            </h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
              className="border rounded-md pointer-events-auto"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Filter by Specialty</h3>
            <Select 
              value={specialization} 
              onValueChange={handleSpecializationChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {SPECIALIZATIONS.map((spec) => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Available Doctors</h3>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-16 w-16 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <div className="flex gap-2 mt-1">
                              <Skeleton className="h-5 w-24" />
                              <Skeleton className="h-5 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-9 w-24" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-6 border rounded-lg">
                  <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-2" />
                  <p className="text-muted-foreground mb-2">
                    We're having trouble loading doctors right now.
                  </p>
                  <Button variant="outline" onClick={() => refetch()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              ) : doctors && doctors.length > 0 ? (
                <div className="space-y-4">
                  {doctors.map((doctor) => (
                    <Card key={doctor.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 bg-primary/10">
                            <AvatarImage 
                              src={doctor.image || "/placeholder.svg"} 
                              alt={doctor.name || "Doctor"}
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                              {doctor.name?.substring(0, 2).toUpperCase() || "DR"}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-lg">{doctor.name || "Unknown Doctor"}</h4>
                            <p className="text-sm text-primary/80">{doctor.specialty || "General"}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {doctor.experience || 0} years exp
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                ${doctor.fee || 0}/session
                              </Badge>
                            </div>
                          </div>
                          
                          {!isDoctor && (
                            <Button 
                              onClick={() => handleBookAppointment(doctor.id)}
                              className="whitespace-nowrap"
                            >
                              Book Now
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg">
                  <User className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No doctors available for the selected criteria
                  </p>
                  {specialization !== 'all' && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setSpecialization('all')}
                    >
                      View All Specialties
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 border-t flex justify-center pt-4">
        <p className="text-xs text-muted-foreground">
          Select a doctor and date to book your appointment
        </p>
      </CardFooter>
    </Card>
  );
}
