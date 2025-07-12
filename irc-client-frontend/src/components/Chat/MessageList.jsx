import { useEffect, useRef, useMemo } from "react";
import MessageReactions from "./MessageReactions";

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);

  // Memoize unique messages to prevent unnecessary recalculations
  const uniqueMessages = useMemo(() => {
    if (!messages || messages.length === 0) return [];

    return messages.filter(
      (message, index, self) =>
        index === self.findIndex((m) => m._id === message._id)
    );
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isImageFile = (fileName) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    return imageExtensions.some((ext) =>
      fileName?.toLowerCase().endsWith(ext)
    );
  };

  // Scroll only when the deduplicated message list changes
  useEffect(() => {
    scrollToBottom();
  }, [uniqueMessages]);

  if (uniqueMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No messages yet</p>
          <p className="text-sm">Start the conversation! 💬</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {uniqueMessages.map((message) => (
        <div
          key={`msg-${message._id}-${message.createdAt}`}
          className="flex gap-3 hover:bg-gray-800 p-2 rounded-lg transition-colors"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
            {message.userId?.username?.[0]?.toUpperCase() || "U"}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header: sender + timestamp */}
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-semibold text-white">
                {message.userId?.username || "Unknown User"}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Body: text or file preview */}
            <div className="text-gray-300 break-words whitespace-pre-wrap">
              {message.messageType === "file" && message.fileUrl ? (
                <div>
                  {isImageFile(message.fileName) ? (
                    <>
                      <img
                        src={`http://localhost:5000${message.fileUrl}`}
                        alt={message.fileName}
                        className="max-w-xs max-h-64 rounded-lg shadow-md mb-2"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <p className="text-sm text-gray-400">
                        {message.fileName}
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                      <span role="img" aria-label="attachment">
                        📎
                      </span>
                      <span>{message.fileName}</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {message.content}
                  <div className="mt-2">
                    <MessageReactions message={message} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
