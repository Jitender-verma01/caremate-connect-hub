
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar as CalendarIcon, Clock, DollarSign, CreditCard } from "lucide-react";
import { format, addDays, isBefore, isAfter, startOfToday } from "date-fns";
import { useDoctor, useDoctorAvailability } from "@/hooks/useDoctors";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const BookAppointment = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState("Video Consultation");
  const [reason, setReason] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: doctor, isLoading: isLoadingDoctor } = useDoctor(doctorId || "");
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const { data: availability, isLoading: isLoadingAvailability } = useDoctorAvailability(doctorId || "", formattedDate);
  
  const createAppointment = useCreateAppointment();
  
  // Disable dates before today
  const today = startOfToday();
  const disabledDays = (date: Date) => {
    return isBefore(date, today) || isAfter(date, addDays(today, 30));
  };
  
  const handleSubmit = () => {
    if (!doctorId || !selectedDate || !selectedTime || !user) {
      toast.error("Please complete all required fields");
      return;
    }

    createAppointment.mutate({
      doctorId: doctorId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      consultationType: consultationType,
      reason: reason
    }, {
      onSuccess: () => {
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
                className="border rounded-md"
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
              ) : availability && Object.keys(availability).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(availability).map(([period, slots]) => (
                    <div key={period} className="space-y-2">
                      <h3 className="font-medium capitalize">{period}</h3>
                      <div className="flex flex-wrap gap-2">
                        {slots.map(time => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            className="w-20"
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
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
                {doctor.consultationTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={`type-${type}`} />
                    <Label htmlFor={`type-${type}`} className="flex-1">{type}</Label>
                    {type === "Video Consultation" && (
                      <Badge variant="outline" className="ml-auto">Recommended</Badge>
                    )}
                  </div>
                ))}
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
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="text-sm">Consultation Fee</div>
                  <div className="font-medium">${doctor.fee}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm">Platform Fee</div>
                  <div className="font-medium">$5</div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <div>Total</div>
                  <div>${doctor.fee + 5}</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                className="w-full" 
                disabled={!selectedDate || !selectedTime || createAppointment.isPending}
                onClick={handleSubmit}
              >
                {createAppointment.isPending ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Payment
                  </>
                )}
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
