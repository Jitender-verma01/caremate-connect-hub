
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
];

export function AvailabilityManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [availabilityData, setAvailabilityData] = useState<{
    day: string;
    times: Array<{ time: string; status: 'available' | 'booked' }>;
  }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctor profile data including existing availability
  const { data: doctorProfile, isLoading } = useQuery({
    queryKey: ['doctorProfile'],
    queryFn: async () => {
      const response = await api.doctors.getProfile();
      return response.data;
    }
  });

  // Initialize availabilityData whenever doctorProfile changes
  useEffect(() => {
    if (doctorProfile) {
      if (doctorProfile?.available_time_slots?.length) {
        setAvailabilityData(doctorProfile.available_time_slots);
      } else {
        // Initialize with default structure if no slots exist
        const initialData = DAYS_OF_WEEK.map(day => ({
          day,
          times: TIME_SLOTS.map(time => ({ time, status: 'available' as const }))
        }));
        setAvailabilityData(initialData);
      }
    }
  }, [doctorProfile]);

  // Updated mutation to just use time_slots endpoint without doctorId
  const updateAvailability = useMutation({
    mutationFn: () => {
      if (!doctorProfile?._id) {
        throw new Error("Doctor profile not found");
      }
      
      console.log("Sending update with doctor ID:", doctorProfile._id);
      console.log("Sending data:", availabilityData);
      
      return api.doctors.updateAvailability(doctorProfile._id, { 
        available_time_slots: availabilityData 
      });
    },
    onSuccess: () => {
      toast.success('Availability updated successfully');
      queryClient.invalidateQueries({ queryKey: ['doctorProfile'] });
      setError(null);
    },
    onError: (error) => {
      console.error("Error updating availability:", error);
      setError(error instanceof Error ? error.message : 'Unknown error updating availability');
      toast.error(`Failed to update availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const toggleTimeSlot = (dayIndex: number, timeIndex: number) => {
    const newData = [...availabilityData];
    const currentStatus = newData[dayIndex].times[timeIndex].status;
    newData[dayIndex].times[timeIndex].status = currentStatus === 'available' ? 'booked' : 'available';
    setAvailabilityData(newData);
  };

  const saveAvailability = () => {
    updateAvailability.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading availability settings...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Availability</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}. Make sure you have the correct permissions.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue={DAYS_OF_WEEK[0]}>
          <TabsList className="mb-4 w-full overflow-x-auto">
            {DAYS_OF_WEEK.map((day) => (
              <TabsTrigger key={day} value={day}>
                {day}
              </TabsTrigger>
            ))}
          </TabsList>

          {DAYS_OF_WEEK.map((day, dayIndex) => (
            <TabsContent key={day} value={day} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {TIME_SLOTS.map((time, timeIndex) => {
                  // Handle potential undefined data gracefully
                  const isAvailable = availabilityData[dayIndex]?.times[timeIndex]?.status === 'available';
                  
                  return (
                    <div key={time} className="flex items-center justify-between p-3 border rounded">
                      <Label htmlFor={`${day}-${time}`} className="mr-2">{time}</Label>
                      <Switch 
                        id={`${day}-${time}`} 
                        checked={isAvailable}
                        onCheckedChange={() => toggleTimeSlot(dayIndex, timeIndex)}
                      />
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        <div className="mt-6">
          <Button 
            onClick={saveAvailability} 
            disabled={updateAvailability.isPending}
            className="w-full"
          >
            {updateAvailability.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Saving...
              </>
            ) : 'Save Availability'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
