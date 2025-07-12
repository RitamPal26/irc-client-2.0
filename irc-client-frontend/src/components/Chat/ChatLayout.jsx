import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useStore from "../../store/useStore";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import { channelsAPI } from "../../services/api";
import toast from "react-hot-toast";

const ChatLayout = () => {
  const {
    isAuthenticated,
    token,
    user,
    channels,
    setChannels,
    currentChannel,
    connectSocket,
    socket,
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeChat = async () => {
      console.log("🚀 Initializing chat...", {
        isAuthenticated,
        token: !!token,
        user: user?.username,
      });

      if (!isAuthenticated || !token) {
        console.log("❌ Not authenticated, redirecting to auth");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Step 1: Connect socket
        if (!socket) {
          console.log("🔌 Connecting socket...");
          connectSocket(token);
        }

        // Step 2: Load channels with retry logic
        console.log("📁 Loading channels...");
        const response = await channelsAPI.getChannels();

        if (!response.data || !response.data.channels) {
          throw new Error("Invalid channels response");
        }

        console.log("✅ Channels loaded:", response.data.channels.length);
        setChannels(response.data.channels);

        // Step 3: Auto-select first channel if none selected
        if (!currentChannel && response.data.channels.length > 0) {
          useStore.getState().setCurrentChannel(response.data.channels[0]);
        }

        setLoading(false);
        console.log("✅ Chat initialized successfully");
      } catch (error) {
        console.error("❌ Failed to initialize chat:", error);
        setError(error.message || "Failed to initialize chat");
        setLoading(false);

        // Show user-friendly error
        toast.error("Failed to load chat. Please try refreshing the page.");
      }
    };

    initializeChat();
  }, [isAuthenticated, token]); // Remove socket from dependencies

  // Redirect if not authenticated
  if (!isAuthenticated || !token) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Initializing IRC 2.0...</div>
          <div className="text-gray-400 text-sm mt-2">
            Connecting to server and loading channels
          </div>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center bg-gray-800 p-8 rounded-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-bold mb-2">
            Failed to Initialize Chat
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render chat interface
  return (
    <div className="h-screen bg-gray-900 text-white flex chat-container">
      <div className="w-64 bg-gray-800 flex-shrink-0">
        <Sidebar
          channels={channels}
          onRefresh={() => window.location.reload()}
        />
      </div>

      <div className="flex-1 flex flex-col">
        {currentChannel ? (
          <ChatArea channel={currentChannel} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome to IRC 2.0</h2>
              <p className="text-gray-400">
                Select a channel to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
