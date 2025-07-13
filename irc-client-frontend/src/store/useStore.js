import { create } from "zustand";
import { io } from "socket.io-client";

const useStore = create((set, get) => ({
  channelMemberCounts: {},
  /* ────────────── UI ────────────── */
  soundEnabled: true,
  toggleSound: () =>
    set((state) => ({
      soundEnabled: !state.soundEnabled,
    })),

  /* ─────────── Auth state ────────── */
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },

  setChannelMemberCount: (channelName, count) =>
    set((state) => ({
      channelMemberCounts: {
        ...state.channelMemberCounts,
        [channelName]: count,
      },
    })),

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
      currentChannel: null,
      messages: [],
      onlineUsers: [],
      typingUsers: [],
    });
  },

  /* ─────────── Chat state ────────── */
  channels: [],
  currentChannel: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],

  /* ───────────── Socket ──────────── */
  socket: null,

  connectSocket: (token) => {
    const { socket: existingSocket } = get();

    if (existingSocket) {
      console.log("🔌 Disconnecting existing socket");
      existingSocket.disconnect();
    }

    try {
      const newSocket = io("http://localhost:5000", {
        auth: { token },
        forceNew: true,
        timeout: 5000,
      });

      newSocket.on?.("connect", () => {
        console.log("✅ Connected to server");
      });

      newSocket.on?.("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
      });

      newSocket.on?.("disconnect", (reason) => {
        console.log("🔌 Socket disconnected:", reason);
      });

      newSocket.on?.("new-message", (message) => {
        console.log("📨 New message received:", message);

        set((state) => {
          const duplicate = state.messages.some((m) => m._id === message._id);
          if (duplicate) return state;
          return { messages: [...state.messages, message] };
        });
      });

      // ADD THIS NEW LISTENER
      newSocket.on?.("reaction-updated", (data) => {
        console.log("🎭 Reaction updated:", data);

        set((state) => ({
          messages: state.messages.map((message) =>
            message._id === data.messageId
              ? { ...message, reactions: data.reactions }
              : message
          ),
        }));
      });

      set({ socket: newSocket });
    } catch (error) {
      console.error("❌ Failed to create socket:", error);
      set({ socket: null });
    }
  },

  /* ───────── Channel actions ─────── */
  setChannels: (channels) => set({ channels }),
  setCurrentChannel: (channel) => set({ currentChannel: channel }),
  setMessages: (messages) => set({ messages }),

  /* ───────── Message actions ─────── */
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
