import { create } from 'zustand';
import { io } from 'socket.io-client';

const useStore = create((set, get) => ({
  // Auth state
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  
  // Chat state
  channels: [],
  currentChannel: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  
  // Socket
  socket: null,
  
  // Actions
  setUser: (user) => set({ user, isAuthenticated: true }),
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('token');
    const { socket } = get();
    if (socket) socket.disconnect();
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false,
      socket: null,
      channels: [],
      messages: []
    });
  },
  
  // Socket actions
  connectSocket: (token) => {
    const socket = io('http://localhost:5000', {
      auth: { token }
    });
    
    socket.on('connect', () => {
      console.log('Connected to server');
    });
    
    socket.on('new-message', (message) => {
      set((state) => ({
        messages: [...state.messages, message]
      }));
    });
    
    socket.on('user-typing', (data) => {
      set((state) => ({
        typingUsers: [...state.typingUsers.filter(u => u !== data.user), data.user]
      }));
    });
    
    socket.on('user-stop-typing', (data) => {
      set((state) => ({
        typingUsers: state.typingUsers.filter(u => u !== data.user)
      }));
    });
    
    set({ socket });
  },
  
  // Channel actions
  setChannels: (channels) => set({ channels }),
  setCurrentChannel: (channel) => set({ currentChannel: channel }),
  setMessages: (messages) => set({ messages }),
  
  // Message actions
  sendMessage: (content) => {
    const { socket, currentChannel } = get();
    if (socket && currentChannel) {
      socket.emit('send-message', {
        channelId: currentChannel._id,
        content,
        messageType: 'text'
      });
    }
  }
}));

export default useStore;
