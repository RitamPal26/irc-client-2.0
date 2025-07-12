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

  // Group reactions by emoji
  const groupedReactions = (message.reactions || []).reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        users: [],
      };
    }
    acc[reaction.emoji].count += reaction.users.length;
    acc[reaction.emoji].users.push(...reaction.users);
    return acc;
  }, {});

  return (
    <div className="flex items-center gap-2 mt-1">
      {/* Existing reactions */}
      {Object.values(groupedReactions).map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => addReaction(reaction.emoji)}
          className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-xs"
        >
          <span>{reaction.emoji}</span>
          <span>{reaction.count}</span>
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
