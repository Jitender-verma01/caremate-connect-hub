
import { io } from 'socket.io-client';

// Use the same base URL as API
const API_BASE_URL = "https://caremate-connect-hub.onrender.com";

// Create socket instance but don't connect automatically
export const socket = io(API_BASE_URL, { 
  autoConnect: false,
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true
});

// Add connection event listeners for debugging
socket.on('connect', () => {
  console.log('Socket connected with ID:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Socket reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (error) => {
  console.error('Socket reconnection error:', error);
});

// Middleware to add auth token to socket connection
export const setupSocketAuth = (token: string | null) => {
  if (token) {
    socket.auth = { token };
  } else {
    delete socket.auth;
  }
};

// Helper function to ensure socket is connected
export const ensureSocketConnection = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

// Helper function to disconnect socket
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
