import { useState, useRef } from "react";
import { Send } from "lucide-react";
import useStore from "../../store/useStore";
import { processCommand } from "../../utils/commandParser";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const {
    sendMessage,
    currentChannel,
    socket,
    user,
    channels,
    setCurrentChannel,
    setMessages,
    messages,
  } = useStore();
  const typingTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    // Send typing indicator (only for regular messages, not commands)
    if (
      !isTyping &&
      currentChannel &&
      socket &&
      e.target.value.trim() &&
      !e.target.value.startsWith("/")
    ) {
      setIsTyping(true);
      socket.emit("typing-start", {
        channelId: currentChannel._id,
        username: user.username,
      });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && socket) {
        setIsTyping(false);
        socket.emit("typing-stop", {
          channelId: currentChannel._id,
          username: user.username,
        });
      }
    }, 2000);
  };

  const handleNonAICommand = (command) => {
    switch (command.type) {
      case "JOIN_CHANNEL":
        const targetChannel = channels.find(
          (c) =>
            c.name.toLowerCase() === command.payload.channelName.toLowerCase()
        );
        if (targetChannel) {
          setCurrentChannel(targetChannel);
          toast.success(`Joined #${targetChannel.name}`);
        } else {
          toast.error(`Channel #${command.payload.channelName} not found`);
        }
        break;

      case "LIST_CHANNELS":
        const channelList = channels.map((c) => `#${c.name}`).join(", ");
        toast.success(`Available channels: ${channelList}`);
        break;

      case "SHOW_HELP":
        toast.success(`Available commands:
/join #channel - Join a channel
/nick newname - Change nickname
/msg user message - Send private message
/list - List all channels
/ai question - Ask AI a question
/help - Show this help`);
        break;

      case "CHANGE_NICK":
        toast.info("Nickname change feature coming soon!");
        break;

      case "PRIVATE_MESSAGE":
        toast.info("Private messaging feature coming soon!");
        break;

      default:
        toast.error(`Unknown command: /${command.command}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentChannel) return;

    // Stop typing indicator immediately
    if (isTyping && socket) {
      setIsTyping(false);
      socket.emit("typing-stop", {
        channelId: currentChannel._id,
        username: user.username,
      });
    }

    // Check if it's a command
    if (message.startsWith("/")) {
      // Use the new processCommand for AI commands
      const result = await processCommand(message, user);

      if (result) {
        // Handle AI response specifically
        if (result.type === "ai_response") {
          const aiMessage = {
            _id: `ai-${Date.now()}`,
            content: result.content,
            userId: { username: "AI-Bot", _id: "ai-bot" },
            createdAt: new Date().toISOString(),
          };
          setMessages([...messages, aiMessage]);
        } else {
          // Handle other commands with the old logic
          handleNonAICommand(result);
        }
      }
    } else {
      sendMessage(message.trim());
    }

    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        placeholder={
          message.startsWith("/")
            ? "Enter IRC command..."
            : `Message #${currentChannel?.name || "channel"}`
        }
        className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        maxLength={2000}
      />
      <button
        type="submit"
        disabled={!message.trim()}
        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        <Send size={18} />
      </button>
    </form>
  );
};

export default MessageInput;
