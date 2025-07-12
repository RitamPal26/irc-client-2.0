import { useState } from "react";
import { Hash, LogOut } from "lucide-react";
import useStore from "../../store/useStore";
import { channelsAPI } from "../../services/api";
import toast from "react-hot-toast";

const Sidebar = ({ channels, onRefresh }) => {
  const { user, logout, currentChannel, setCurrentChannel, socket } =
    useStore();

  const handleChannelSelect = async (channel) => {
    setCurrentChannel(channel);

    try {
      const response = await channelsAPI.getMessages(channel._id);
      // Ensure reactions are included in the fetched messages
      const messagesWithReactions = response.data.messages.map((msg) => ({
        ...msg,
        reactions: msg.reactions || [], // Fallback to empty array if missing
      }));
      useStore.getState().setMessages(messagesWithReactions);
    } catch (error) {
      console.error("Failed to load messages with reactions:", error);
      toast.error("Failed to load messages");
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">IRC 2.0</h1>
        <p className="text-sm text-gray-400">Welcome, {user?.username}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-sm font-semibold text-gray-300 uppercase mb-3">
          Channels
        </h2>
        <div className="space-y-1">
          {channels.map((channel) => (
            <button
              key={channel._id}
              onClick={() => handleChannelSelect(channel)}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left hover:bg-gray-700 ${
                currentChannel?._id === channel._id ? "bg-gray-700" : ""
              }`}
            >
              <Hash size={16} className="text-gray-400" />
              <span className="text-sm">{channel.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm">{user?.username}</span>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
