import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  MapPin, 
  Users, 
  Smile, 
  MoreVertical,
  AlertTriangle,
  Info,
  X,
  Phone,
  Navigation
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../App';
import io from 'socket.io-client';

const ChatComponent = ({ rideId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const { user } = useAuth();

  useEffect(() => {
    initializeChat();
    return () => {
      cleanup();
    };
  }, [rideId]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch initial data
      await Promise.all([
        fetchMessages(),
        fetchParticipants()
      ]);

      // Initialize socket connection
      initializeSocket();

    } catch (error) {
      console.error('Error initializing chat:', error);
      setError('Failed to load chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/chat/${rideId}/messages`);
      setMessages(response.data.messages);
      setRide(response.data.ride);
    } catch (error) {
      if (error.response?.status === 403) {
        setError('You must be a confirmed passenger or the driver to access this chat.');
      } else {
        console.error('Error fetching messages:', error);
        throw error;
      }
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await axios.get(`/api/chat/${rideId}/participants`);
      setParticipants(response.data);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required for chat');
      return;
    }

    const newSocket = io('/', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to chat server');
      setIsConnected(true);
      newSocket.emit('join-ride-chat', rideId);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from chat server');
      setIsConnected(false);
    });

    newSocket.on('joined_chat', () => {
      console.log('✅ Successfully joined ride chat');
    });

    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    newSocket.on('message_deleted', ({ messageId }) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    });

    newSocket.on('user_joined', ({ userName }) => {
      if (userName !== user.name) {
        toast.success(`${userName} joined the chat`, { duration: 2000 });
      }
    });

    newSocket.on('user_left', ({ userName }) => {
      if (userName !== user.name) {
        toast(`${userName} left the chat`, { duration: 2000 });
      }
    });

    newSocket.on('user_typing', ({ userId, userName }) => {
      if (userId !== user.id) {
        setTypingUsers(prev => {
          if (!prev.some(u => u.userId === userId)) {
            return [...prev, { userId, userName }];
          }
          return prev;
        });
      }
    });

    newSocket.on('user_stopped_typing', ({ userId }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId));
    });

    newSocket.on('ride_status_updated', ({ status, updatedBy }) => {
      toast.success(`Ride status updated to ${status} by ${updatedBy}`, { duration: 3000 });
      setRide(prev => ({ ...prev, status }));
    });

    newSocket.on('error', ({ message }) => {
      toast.error(message);
      console.error('Socket error:', message);
    });

    setSocket(newSocket);
  };

  const cleanup = () => {
    if (socket) {
      socket.emit('leave-ride-chat', rideId);
      socket.disconnect();
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await axios.post(`/api/chat/${rideId}/messages`, {
        message: newMessage.trim()
      });
      
      setNewMessage('');
      stopTyping();
      
    } catch (error) {
      if (error.response?.data?.moderation) {
        // Content moderation error
        toast.error(error.response.data.error, { duration: 5000 });
      } else {
        toast.error('Failed to send message');
      }
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`/api/chat/${rideId}/messages/${messageId}`);
      // Message will be removed via socket event
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const shareLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (socket) {
          socket.emit('share_location', {
            rideId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            message: 'Shared current location'
          });
          toast.success('Location shared!');
        }
      },
      (error) => {
        toast.error('Unable to get your location');
        console.error('Geolocation error:', error);
      }
    );
  };

  const handleTyping = () => {
    if (socket && !typingTimeoutRef.current) {
      socket.emit('typing_start', rideId);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = () => {
    if (socket) {
      socket.emit('typing_stop', rideId);
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = null;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-festival-orange mx-auto mb-2"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Chat Unavailable</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button onClick={onClose} className="btn-secondary">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col max-h-[600px]">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-festival-gradient text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            <div>
              <h3 className="font-semibold">Ride Chat</h3>
              <p className="text-sm opacity-90">
                {ride?.pickup_location} • {formatDate(ride?.departure_time)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Connection Status */}
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            
            {/* Participants Button */}
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              title="View participants"
            >
              <Users className="h-4 w-4" />
              <span className="ml-1 text-sm">{participants.length}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);
                
                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="text-center text-sm text-gray-500 py-2">
                        {formatDate(message.created_at)}
                      </div>
                    )}
                    
                    <div className={`flex ${message.is_own_message ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        message.is_own_message 
                          ? 'bg-festival-orange text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {!message.is_own_message && (
                          <div className="text-xs font-semibold mb-1 text-festival-orange">
                            {message.user_name}
                          </div>
                        )}
                        
                        {message.message_type === 'location' ? (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <div>
                              <div className="text-sm">{message.message}</div>
                              <button
                                onClick={() => {
                                  const url = `https://maps.google.com/?q=${message.location_lat},${message.location_lng}`;
                                  window.open(url, '_blank');
                                }}
                                className="text-xs underline opacity-80 hover:opacity-100"
                              >
                                View on map
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>{message.message}</div>
                        )}
                        
                        <div className="flex items-center justify-between mt-1">
                          <div className={`text-xs opacity-70`}>
                            {formatTime(message.created_at)}
                          </div>
                          
                          {message.is_own_message && (
                            <button
                              onClick={() => deleteMessage(message.id)}
                              className="text-xs opacity-70 hover:opacity-100 ml-2"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            
            {/* Typing Indicators */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm">
                  {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-festival-orange focus:border-transparent"
                  disabled={sending}
                />
              </div>
              
              <button
                onClick={shareLocation}
                className="p-2 text-gray-500 hover:text-festival-orange transition-colors"
                title="Share location"
              >
                <Navigation className="h-5 w-5" />
              </button>
              
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            
            <div className="text-xs text-gray-500 mt-2">
              💡 Keep it friendly! Messages are monitored for appropriate content.
            </div>
          </div>
        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-64 border-l border-gray-200 bg-gray-50">
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Participants ({participants.length})</h4>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-2 bg-white rounded">
                    <div>
                      <div className="font-medium text-sm">{participant.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{participant.role}</div>
                    </div>
                    <a
                      href={`tel:${participant.phone}`}
                      className="text-festival-orange hover:text-festival-blue"
                      title="Call"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatComponent; 