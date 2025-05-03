
import { format } from 'date-fns';

// Helper function to determine if an appointment is happening now
export function isAppointmentNow(appointment: any) {
  const appointmentDate = new Date(appointment.date);
  const today = new Date();
  
  // Check if it's the same day
  const sameDay = format(appointmentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  
  if (!sameDay) return false;
  
  // Extract hours from appointment time (format: "10:00 AM")
  const [time, period] = (appointment.time as string).split(' ');
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

// Format appointment time slot for display
export function formatAppointmentTime(appointment: any) {
  // Check if timeSlot is an object or a string
  if (typeof appointment.timeSlot === 'object' && appointment.timeSlot !== null) {
    return appointment.timeSlot.time;
  }
  
  if (typeof appointment.time === 'string') {
    return appointment.time;
  }
  
  if (typeof appointment.timeSlot === 'string') {
    return appointment.timeSlot;
  }
  
  return 'Unknown time';
}
