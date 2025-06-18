
import { Server } from 'socket.io';
import { Appointment } from '../models/appointment.model.js';

export const initializeSignaling = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  // Store user-socket mappings
  const userSocketMap = new Map();
  const socketUserMap = new Map();

  io.on('connection', (socket) => {
    console.log('User connected with socket ID:', socket.id);

    // Helper function for appointment validation
    const validateAppointment = async (roomId, userId) => {
      const appointment = await Appointment.findOne({ roomId }).populate([
        { path: 'patientId', populate: { path: 'user_id' } },
        { path: 'doctorId', populate: { path: 'user_id' } }
      ]);
      
      if (!appointment) return { error: 'Appointment not found', appointment: null };

      const { patientId, doctorId } = appointment;
      const actualPatientUserId = patientId.user_id._id.toString();
      const actualDoctorUserId = doctorId.user_id._id.toString();

      console.log('Validating access for user:', userId);
      console.log('Patient user ID:', actualPatientUserId);
      console.log('Doctor user ID:', actualDoctorUserId);

      if (userId !== actualPatientUserId && userId !== actualDoctorUserId) {
        console.log('Access denied: User not authorized for this appointment');
        return { error: 'Unauthorized access to this appointment', appointment: null };
      }

      return { error: null, appointment };
    };

    // Join a room
    socket.on('join-room', async (roomId, userId) => {
      try {
        console.log(`User ${userId} attempting to join room ${roomId} with socket ${socket.id}`);
        
        const { error, appointment } = await validateAppointment(roomId, userId);
        if (error) {
          console.log('Validation error:', error);
          socket.emit('error', error);
          return;
        }

        // Store user-socket mapping
        userSocketMap.set(userId, socket.id);
        socketUserMap.set(socket.id, { userId, roomId });

        console.log(`${userId} successfully joined room ${roomId}`);
        socket.join(roomId);
        
        // Notify other users in the room that this user connected
        socket.to(roomId).emit('user-connected', userId);
        console.log(`Notified room ${roomId} that user ${userId} connected`);

        // Update appointment session start time if not already set
        if (!appointment.sessionStart) {
          appointment.sessionStart = new Date();
          await appointment.save();
        }

      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', 'An unexpected error occurred while joining the room');
      }
    });

    // Handle session ending (only doctor can end)
    socket.on('end-session', async (roomId, userId) => {
      try {
        const appointment = await Appointment.findOne({ roomId }).populate([
          { path: 'doctorId', populate: { path: 'user_id' } }
        ]);
        
        if (!appointment) {
          socket.emit('error', 'Appointment not found');
          return;
        }

        const actualDoctorUserId = appointment.doctorId.user_id._id.toString();

        if (userId !== actualDoctorUserId) {
          socket.emit('error', 'Only the doctor can end the session');
          return;
        }

        appointment.status = 'completed';
        appointment.sessionEnd = new Date();
        await appointment.save();

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

    // Handle chat messages - broadcast to all users in the room
    socket.on('send-message', (roomId, message) => {
      console.log(`Message in room ${roomId} from ${message.sender}:`, message.text);
      
      // Broadcast to all users in the room including sender
      io.to(roomId).emit('receive-message', message);
      console.log(`Message broadcasted to room ${roomId}`);
    });

    // WebRTC signaling events - use userId for proper routing
    socket.on('offer', (roomId, offer) => {
      const senderData = socketUserMap.get(socket.id);
      console.log(`Offer sent to room ${roomId} by user ${senderData?.userId}`);
      socket.to(roomId).emit('offer', offer);
    });

    socket.on('answer', (roomId, answer) => {
      const senderData = socketUserMap.get(socket.id);
      console.log(`Answer sent to room ${roomId} by user ${senderData?.userId}`);
      socket.to(roomId).emit('answer', answer);
    });

    socket.on('ice-candidate', (roomId, candidate) => {
      const senderData = socketUserMap.get(socket.id);
      console.log(`ICE candidate sent to room ${roomId} by user ${senderData?.userId}`);
      socket.to(roomId).emit('ice-candidate', candidate);
    });

    // Handle user leaving room manually
    socket.on('leave-room', (roomId, userId) => {
      console.log(`${userId} leaving room ${roomId}`);
      socket.leave(roomId);
      socket.to(roomId).emit('user-disconnected', userId);
      
      // Clean up mappings
      userSocketMap.delete(userId);
      socketUserMap.delete(socket.id);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const userData = socketUserMap.get(socket.id);
      if (userData) {
        const { userId, roomId } = userData;
        console.log(`${userId} disconnected from room ${roomId}`);
        socket.to(roomId).emit('user-disconnected', userId);
        
        // Clean up mappings
        userSocketMap.delete(userId);
        socketUserMap.delete(socket.id);
      }
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
};
