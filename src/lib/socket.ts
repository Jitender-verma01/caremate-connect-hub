
import { io } from 'socket.io-client';

// Use the same base URL as API
const API_BASE_URL = "https://caremate-connect-hub.onrender.com";
// https://caremate-connect-hub.onrender.com
// Create socket instance but don't connect automatically
export const socket = io(API_BASE_URL, { 
  autoConnect: false,
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: false, // Changed to false to reuse connections
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5 // Changed from maxReconnectionAttempts to reconnectionAttempts
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
    (socket as any).auth = undefined;
  }
};

// Helper function to ensure socket is connected
export const ensureSocketConnection = () => {
  return new Promise<void>((resolve, reject) => {
    if (socket.connected) {
      resolve();
      return;
    }

    // Set up one-time listeners
    const onConnect = () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      resolve();
    };

    const onConnectError = (error: Error) => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      reject(error);
    };

    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);

    socket.connect();

    // Timeout after 10 seconds
    setTimeout(() => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      reject(new Error('Socket connection timeout'));
    }, 10000);
  });
};

// Helper function to disconnect socket
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
