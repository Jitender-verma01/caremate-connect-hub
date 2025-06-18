
import { Server } from 'socket.io';
import { Appointment } from '../models/appointment.model.js';

export const initializeSignaling = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Helper function for appointment validation
    const validateAppointment = async (roomId, userId) => {
      const appointment = await Appointment.findOne({ roomId }).populate([
        { path: 'patientId', populate: { path: 'user_id' } },
        { path: 'doctorId', populate: { path: 'user_id' } }
      ]);
      
      if (!appointment) return { error: 'Appointment not found', appointment: null };

      const { patientId, doctorId, appointmentDate } = appointment;
      const now = new Date();

      // Get the actual user IDs from populated data
      const actualPatientUserId = patientId.user_id._id.toString();
      const actualDoctorUserId = doctorId.user_id._id.toString();

      console.log('Validating access for user:', userId);
      console.log('Patient user ID:', actualPatientUserId);
      console.log('Doctor user ID:', actualDoctorUserId);

      // Validate user access - check against actual user IDs
      if (userId !== actualPatientUserId && userId !== actualDoctorUserId) {
        console.log('Access denied: User not authorized for this appointment');
        return { error: 'Unauthorized access to this appointment', appointment: null };
      }

      // Check if appointment time is valid (allow joining 15 minutes before and 2 hours after)
      const appointmentDateTime = new Date(appointmentDate);
      const bufferTime = 15 * 60 * 1000; // 15 minutes in milliseconds
      const sessionDuration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

      if (now < new Date(appointmentDateTime.getTime() - bufferTime)) {
        return { error: 'Session has not started yet', appointment: null };
      }
      if (now > new Date(appointmentDateTime.getTime() + sessionDuration)) {
        return { error: 'Session time has ended', appointment: null };
      }

      return { error: null, appointment };
    };

    // Join a room
    socket.on('join-room', async (roomId, userId) => {
      try {
        console.log(`User ${userId} attempting to join room ${roomId}`);
        
        const { error, appointment } = await validateAppointment(roomId, userId);
        if (error) {
          console.log('Validation error:', error);
          socket.emit('error', error);
          return;
        }

        console.log(`${userId} successfully joined room ${roomId}`);
        socket.join(roomId);
        
        // Notify other users in the room that this user connected
        socket.to(roomId).emit('user-connected', userId);

        // Update appointment session start time if not already set
        if (!appointment.sessionStart) {
          appointment.sessionStart = new Date();
          await appointment.save();
        }

        // Handle disconnection
        socket.on('disconnect', () => {
          console.log(`${userId} disconnected from room ${roomId}`);
          socket.to(roomId).emit('user-disconnected', userId);
        });

      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', 'An unexpected error occurred while joining the room');
      }
    });

    // Handle session ending (only doctor can end)
    socket.on('end-session', async (roomId, userId) => {
      try {
        const appointment = await Appointment.findOne({ roomId });
        if (!appointment) {
          socket.emit('error', 'Appointment not found');
          return;
        }

        // Only the doctor can end the session
        if (userId !== String(appointment.doctorId)) {
          socket.emit('error', 'Only the doctor can end the session');
          return;
        }

        // Update appointment status and session end time
        appointment.status = 'completed';
        appointment.sessionEnd = new Date();
        await appointment.save();

        // Notify all participants in the room
        io.to(roomId).emit('session-ended', {
          message: 'The session has ended',
          roomId,
          endTime: appointment.sessionEnd,
        });

        console.log(`Session ${roomId} ended by doctor ${userId}`);

      } catch (error) {
        console.error('Error ending session:', error);
        socket.emit('error', 'An unexpected error occurred while ending the session');
      }
    });

    // Handle chat messages
    socket.on('send-message', (roomId, message) => {
      console.log(`Message in room ${roomId}:`, message);
      socket.to(roomId).emit('receive-message', message);
    });

    // WebRTC signaling events
    socket.on('offer', (roomId, offer) => {
      console.log(`Offer sent to room ${roomId}`);
      socket.to(roomId).emit('offer', offer);
    });

    socket.on('answer', (roomId, answer) => {
      console.log(`Answer sent to room ${roomId}`);
      socket.to(roomId).emit('answer', answer);
    });

    socket.on('ice-candidate', (roomId, candidate) => {
      console.log(`ICE candidate sent to room ${roomId}`);
      socket.to(roomId).emit('ice-candidate', candidate);
    });

    // Handle user leaving room manually
    socket.on('leave-room', (roomId, userId) => {
      console.log(`${userId} leaving room ${roomId}`);
      socket.leave(roomId);
      socket.to(roomId).emit('user-disconnected', userId);
    });

  });

  return io;
};
