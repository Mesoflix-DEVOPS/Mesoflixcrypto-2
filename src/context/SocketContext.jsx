import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getApiUrl } from '../config/api';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeSubscriptions, setActiveSubscriptions] = useState(new Set());

  useEffect(() => {
    // 1. Initialize Global Socket (Hard-coded for institutional stability)
    const socketUrl = 'https://api.mesoflixlabs.com';
    console.log(`[SOCKET_SYSTEM] Connecting to institutional hub: ${socketUrl}`);
    
    const socket = io(socketUrl, {
      transports: ['websocket'],
      withCredentials: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[SOCKET_SYSTEM] Link Established');
      setIsConnected(true);
      // Re-subscribe to all active topics on reconnect
      if (activeSubscriptions.size > 0) {
        socket.emit('subscribe', Array.from(activeSubscriptions));
      }
    });

    socket.on('disconnect', () => {
      console.warn('[SOCKET_SYSTEM] Link Dropped');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[SOCKET_SYSTEM] Link Error:', err.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // API: Subscribe to a symbol (Ticker Data)
  const subscribeToTicker = (symbol) => {
    if (!socketRef.current || !symbol) return;
    setActiveSubscriptions(prev => {
      const next = new Set(prev);
      next.add(symbol);
      socketRef.current.emit('subscribe', [symbol]);
      return next;
    });
  };

  // API: Unsubscribe from a symbol
  const unsubscribeFromTicker = (symbol) => {
    if (!socketRef.current || !symbol) return;
    setActiveSubscriptions(prev => {
      const next = new Set(prev);
      next.delete(symbol);
      socketRef.current.emit('unsubscribe', [symbol]);
      return next;
    });
  };

  // API: Initialize Private Stream (Balances/Positions)
  const initPrivateStream = (userId, environment) => {
    if (!socketRef.current || !userId) return;
    console.log(`[SOCKET_SYSTEM] Initializing Private Stream for ${userId}`);
    socketRef.current.emit('init_private_stream', { userId, environment });
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    subscribeToTicker,
    unsubscribeFromTicker,
    initPrivateStream,
    activeSubscriptions
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
