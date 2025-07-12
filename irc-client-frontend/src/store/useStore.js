import { create } from "zustand";
import { io } from "socket.io-client";

const useStore = create((set, get) => ({
  // Auth state
  user: null,
  token: localStorage.getItem("token"),
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
    localStorage.setItem("token", token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem("token");
    const { socket } = get();
    if (socket) socket.disconnect();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      socket: null,
      channels: [],
      messages: [],
    });
  },

  // Socket actions
  connectSocket: (token) => {
    const { socket } = get();

    // Disconnect existing socket before creating new one
    if (socket) {
      console.log("🔌 Disconnecting existing socket");
      socket.disconnect();
    }

    try {
      const newSocket = io("http://localhost:5000", {
        auth: { token },
        forceNew: true,
        timeout: 5000,
      });

      // Add null checks for all event listeners
      newSocket?.on("connect", () => {
        console.log("✅ Connected to server");
      });

      newSocket?.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
      });

      newSocket?.on("disconnect", (reason) => {
        console.log("🔌 Socket disconnected:", reason);
      });

      newSocket?.on("new-message", (message) => {
        console.log("📨 New message received:", message);
        set((state) => {
          const messageExists = state.messages.some(
            (m) => m._id === message._id
          );
          if (messageExists) return state;
          return { messages: [...state.messages, message] };
        });
      });

      // Only set socket if creation was successful
      if (newSocket) {
        set({ socket: newSocket });
      }
    } catch (error) {
      console.error("❌ Failed to create socket:", error);
      set({ socket: null });
    }
  },

  // Channel actions
  setChannels: (channels) => set({ channels }),
  setCurrentChannel: (channel) => set({ currentChannel: channel }),
  setMessages: (messages) => set({ messages }),

  // Message actions
  sendMessage: (content) => {
    const { socket, currentChannel } = get();
    if (socket && currentChannel) {
      socket.emit("send-message", {
        channelId: currentChannel._id,
        content,
        messageType: "text",
      });
    }
  },
}));

export default useStore;
