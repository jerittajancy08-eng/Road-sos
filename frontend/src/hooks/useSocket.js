import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Singleton Socket.io client instance
let socketInstance;

export const useSocket = (url = 'http://localhost:5000') => {
  const socketRef = useRef();

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(url, {
        transports: ['websocket'],
        reconnection: true,
      });
    }
    socketRef.current = socketInstance;
    // No cleanup to keep the connection alive across components
  }, [url]);

  return socketRef.current;
};

export const getSocket = () => socketInstance;
