import { useEffect, useRef } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import useStore from "../../store/useStore";
import TypingIndicator from "./TypingIndicator";
import useSound from "../../hooks/useSound";

const ChatArea = ({ channel }) => {
  const { messages, soundEnabled, user, socket, setChannelMemberCount } =
    useStore();
  const { playNotificationSound } = useSound();

  useEffect(() => {
    if (socket) {
      socket.on("channel-member-count", ({ channelName, memberCount }) => {
        setChannelMemberCount(channelName, memberCount);
      });

      return () => {
        socket.off("channel-member-count");
      };
    }
  }, [socket, setChannelMemberCount]);

  // Play sound when new message arrives
  useEffect(() => {
    if (soundEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Only play sound for messages from other users
      if (lastMessage.userId?.username !== user?.username) {
        playNotificationSound();
      }
    }
  }, [messages.length, soundEnabled, playNotificationSound, user]);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* Channel Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700 bg-gray-800">
        <h2 className="text-lg font-semibold truncate">#{channel?.name}</h2>
        <p className="text-sm text-gray-400 truncate">{channel?.description}</p>
      </div>

      {/* Messages Area - Let MessageList handle its own scrolling */}
      <div className="flex-1 min-h-0">
        <MessageList messages={messages} />
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 p-4 border-t border-gray-700">
        <TypingIndicator />
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatArea;
