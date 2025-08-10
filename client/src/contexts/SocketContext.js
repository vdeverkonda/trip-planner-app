import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5001', {
        auth: {
          userId: user.id
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        toast.error('Connection error. Some features may not work properly.');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else if (socket) {
      // Disconnect socket if user logs out
      socket.close();
      setSocket(null);
      setConnected(false);
    }
  }, [isAuthenticated, user]);

  // Trip-related socket functions
  const joinTrip = (tripId) => {
    if (socket) {
      socket.emit('join-trip', tripId);
    }
  };

  const leaveTrip = (tripId) => {
    if (socket) {
      socket.emit('leave-trip', tripId);
    }
  };

  const sendMessage = (tripId, messageData) => {
    if (socket) {
      socket.emit('send-message', {
        tripId,
        ...messageData
      });
    }
  };

  const updateItinerary = (tripId, itineraryData) => {
    if (socket) {
      socket.emit('update-itinerary', {
        tripId,
        ...itineraryData
      });
    }
  };

  const updateBudget = (tripId, budgetData) => {
    if (socket) {
      socket.emit('update-budget', {
        tripId,
        ...budgetData
      });
    }
  };

  const castVote = (tripId, voteData) => {
    if (socket) {
      socket.emit('cast-vote', {
        tripId,
        ...voteData
      });
    }
  };

  // Event listeners setup
  const onNewMessage = (callback) => {
    if (socket) {
      socket.on('new-message', callback);
      return () => socket.off('new-message', callback);
    }
  };

  const onItineraryUpdated = (callback) => {
    if (socket) {
      socket.on('itinerary-updated', callback);
      return () => socket.off('itinerary-updated', callback);
    }
  };

  const onBudgetUpdated = (callback) => {
    if (socket) {
      socket.on('budget-updated', callback);
      return () => socket.off('budget-updated', callback);
    }
  };

  const onVoteCast = (callback) => {
    if (socket) {
      socket.on('vote-cast', callback);
      return () => socket.off('vote-cast', callback);
    }
  };

  const onUserJoined = (callback) => {
    if (socket) {
      socket.on('user-joined', callback);
      return () => socket.off('user-joined', callback);
    }
  };

  const onUserLeft = (callback) => {
    if (socket) {
      socket.on('user-left', callback);
      return () => socket.off('user-left', callback);
    }
  };

  const value = {
    socket,
    connected,
    joinTrip,
    leaveTrip,
    sendMessage,
    updateItinerary,
    updateBudget,
    castVote,
    onNewMessage,
    onItineraryUpdated,
    onBudgetUpdated,
    onVoteCast,
    onUserJoined,
    onUserLeft
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
