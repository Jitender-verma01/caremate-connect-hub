
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

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

  // Fetch doctor profile data including existing availability
  const { data: doctorProfile, isLoading } = useQuery({
    queryKey: ['doctorProfile'],
    queryFn: async () => {
      const response = await api.doctors.getProfile();
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.available_time_slots?.length) {
        setAvailabilityData(data.available_time_slots);
      } else {
        // Initialize with default structure if no slots exist
        const initialData = DAYS_OF_WEEK.map(day => ({
          day,
          times: TIME_SLOTS.map(time => ({ time, status: 'available' as const }))
        }));
        setAvailabilityData(initialData);
      }
    }
  });

  const updateAvailability = useMutation({
    mutationFn: (data: any) => {
      return api.doctors.updateAvailability(doctorProfile._id, { available_time_slots: data });
    },
    onSuccess: () => {
      toast.success('Availability updated successfully');
      queryClient.invalidateQueries({ queryKey: ['doctorProfile'] });
    },
    onError: (error) => {
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
    updateAvailability.mutate(availabilityData);
  };

  if (isLoading) {
    return <div>Loading availability settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Availability</CardTitle>
      </CardHeader>
      <CardContent>
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
            {updateAvailability.isPending ? 'Saving...' : 'Save Availability'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
