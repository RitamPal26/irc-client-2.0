import { useState } from "react";
import useStore from "../../store/useStore";

const MessageReactions = ({ message }) => {
  const [showPicker, setShowPicker] = useState(false);
  const { socket, user, currentChannel } = useStore();

  const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  const addReaction = (emoji) => {
    if (socket && currentChannel) {
      socket.emit("add-reaction", {
        messageId: message._id,
        emoji,
        channelId: currentChannel._id,
        userId: user._id,
      });
    }
    setShowPicker(false);
  };

  // Fixed: Properly process reactions from your backend format
  const reactions = message.reactions || [];

  return (
    <div className="flex items-center gap-2 mt-1">
      {/* Existing reactions */}
      {reactions.map((reaction, index) => (
        <button
          key={`${reaction.emoji}-${index}`}
          onClick={() => addReaction(reaction.emoji)}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
            reaction.users.includes(user._id)
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <span>{reaction.emoji}</span>
          <span>{reaction.users.length}</span>
        </button>
      ))}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full text-xs"
        >
          😀
        </button>

        {/* Emoji picker */}
        {showPicker && (
          <div className="absolute bottom-8 left-0 bg-gray-800 border border-gray-600 rounded-lg p-2 flex gap-1 z-10">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addReaction(emoji)}
                className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageReactions;
