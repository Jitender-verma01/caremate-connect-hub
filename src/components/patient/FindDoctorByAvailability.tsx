
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { useDoctors } from '@/hooks/useDoctors';
import { Calendar } from '@/components/ui/calendar';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarIcon, User, Clock } from 'lucide-react';

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
  const [specialization, setSpecialization] = useState<string | undefined>();
  const navigate = useNavigate();
  
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  
  const { data: doctors, isLoading } = useDoctors({
    specialization: specialization,
  });

  const handleBookAppointment = (doctorId: string) => {
    navigate(`/book-appointment/${doctorId}?date=${formattedDate}`);
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
              className="border rounded-md"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Filter by Specialty</h3>
            <Select value={specialization} onValueChange={setSpecialization}>
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
                <p className="text-muted-foreground">Loading doctors...</p>
              ) : doctors && doctors.length > 0 ? (
                <div className="space-y-4">
                  {doctors.map((doctor) => (
                    <Card key={doctor.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full overflow-hidden">
                            <img 
                              src={doctor.image || "/placeholder.svg"} 
                              alt={doctor.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium">{doctor.name}</h4>
                            <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {doctor.experience} years exp
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                ${doctor.fee}/session
                              </Badge>
                            </div>
                          </div>
                          
                          <Button 
                            onClick={() => handleBookAppointment(doctor.id)}
                            className="whitespace-nowrap"
                          >
                            Book Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No doctors available for the selected criteria
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
