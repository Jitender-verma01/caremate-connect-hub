
import { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { socket } from '@/lib/socket';

export function useRealTimeNotifications() {
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Connect to socket
    socket.connect();

    // Listen for appointment notifications
    socket.on('appointment-created', (data) => {
      addNotification({
        userId: user.id,
        message: `New appointment scheduled for ${data.date} at ${data.time}`,
        type: 'appointment'
      });
    });

    socket.on('appointment-cancelled', (data) => {
      addNotification({
        userId: user.id,
        message: `Appointment for ${data.date} at ${data.time} has been cancelled`,
        type: 'appointment'
      });
    });

    socket.on('appointment-updated', (data) => {
      addNotification({
        userId: user.id,
        message: `Appointment status changed to ${data.status}`,
        type: 'appointment'
      });
    });

    socket.on('new-doctor-slot', (data) => {
      if (user.role === 'patient') {
        addNotification({
          userId: user.id,
          message: `Dr. ${data.doctorName} just added new availability slots`,
          type: 'system'
        });
      }
    });

    // Clean up
    return () => {
      socket.off('appointment-created');
      socket.off('appointment-cancelled');
      socket.off('appointment-updated');
      socket.off('new-doctor-slot');
      socket.disconnect();
    };
  }, [user, addNotification]);

  return null;
}
