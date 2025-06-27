
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar as CalendarIcon, Clock, DollarSign } from "lucide-react";
import { format, addDays, isBefore, isAfter, startOfToday, parse } from "date-fns";
import { useDoctor, useDoctorAvailability } from "@/hooks/useDoctors";
import { useBookAppointment } from "@/hooks/useAppointments";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";

const BookAppointment = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dateParam ? parse(dateParam, 'yyyy-MM-dd', new Date()) : addDays(new Date(), 1)
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState("Video Consultation");
  const [reason, setReason] = useState("");
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  
  const { data: doctor, isLoading: isLoadingDoctor } = useDoctor(doctorId || "");
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const { data: availability, isLoading: isLoadingAvailability } = useDoctorAvailability(doctorId || "", formattedDate);
  
  const bookAppointment = useBookAppointment();
  
  // Disable dates before today
  const today = startOfToday();
  const disabledDays = (date: Date) => {
    return isBefore(date, today) || isAfter(date, addDays(today, 30));
  };

  // Reset selected time when date changes
  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate]);
  
  const handleSubmit = () => {
    if (!doctorId || !selectedDate || !selectedTime || !user) {
      toast.error("Please complete all required fields");
      return;
    }

    bookAppointment.mutate({
      doctorId: doctorId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      consultationType: consultationType,
      reason: reason
    }, {
      onSuccess: (data) => {
        // Create notification for booking success
        addNotification({
          userId: user.id,
          message: `Appointment booked successfully with Dr. ${doctor?.name} on ${format(selectedDate, 'MMMM d')} at ${selectedTime}`,
          type: "appointment"
        });
        
        navigate("/dashboard");
      }
    });
  };

  if (isLoadingDoctor) {
    return <div className="flex justify-center p-12">Loading doctor information...</div>;
  }

  if (!doctor) {
    return <div className="text-center p-12">Doctor not found</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
        <p className="text-muted-foreground">
          Schedule your appointment with {doctor.name}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - doctor info and booking form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Doctor info card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{doctor.name}</h2>
                  <p className="text-care-primary">{doctor.specialty}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Appointment date */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Select Date
              </CardTitle>
              <CardDescription>Choose your preferred appointment date</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={disabledDays}
                className="border rounded-md pointer-events-auto"
              />
            </CardContent>
          </Card>
          
          {/* Time slot selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Select Time
              </CardTitle>
              <CardDescription>Available time slots for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'selected date'}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAvailability ? (
                <div className="text-center py-4">Loading available times...</div>
              ) : availability && Array.isArray(availability) && availability.length > 0 ? (
                <div className="space-y-4">
                  {availability && availability.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availability[0].times
                      .filter((timeSlot) => timeSlot.status === "available")
                      .map((timeSlot, index) => (
                        <Button
                          key={index}
                          variant={selectedTime === timeSlot.time ? "default" : "outline"}
                          className="w-20"
                          onClick={() => setSelectedTime(timeSlot.time)}
                        >
                          {timeSlot.time}
                        </Button>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No available slots for the selected date. Please try another date.
                  </div>
                )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No available slots for the selected date. Please try another date.
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Consultation type */}
          <Card>
            <CardHeader>
              <CardTitle>Consultation Type</CardTitle>
              <CardDescription>Select how you would like to meet with the doctor</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={consultationType} 
                onValueChange={setConsultationType}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Video Consultation" id="type-video" />
                  <Label htmlFor="type-video" className="flex-1">Video Consultation</Label>
                  <Badge variant="outline" className="ml-auto">Recommended</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="In-person Consultation" id="type-inperson" />
                  <Label htmlFor="type-inperson" className="flex-1">In-person Consultation</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          
          {/* Reason for visit */}
          <Card>
            <CardHeader>
              <CardTitle>Reason for Visit</CardTitle>
              <CardDescription>Briefly describe your symptoms or reason for consultation</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="E.g., I've been experiencing chest pain and shortness of breath..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - appointment summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Appointment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Doctor</div>
                <div className="font-medium">{doctor.name}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Specialty</div>
                <div>{doctor.specialty}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Date & Time</div>
                <div className="font-medium">
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Not selected'} {selectedTime ? `at ${selectedTime}` : ''}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Type</div>
                <div>{consultationType}</div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                className="w-full" 
                disabled={!selectedDate || !selectedTime || bookAppointment.isPending}
                onClick={handleSubmit}
              >
                {bookAppointment.isPending ? "Processing..." : "Book Appointment"}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                By booking this appointment, you agree to our <Link to="/terms" className="underline">Terms of Service</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
