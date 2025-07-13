import { useEffect, useRef, useMemo } from "react";
import MessageReactions from "./MessageReactions";
import { format } from "date-fns";
import useStore from "../../store/useStore";

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);
  const { user } = useStore();

  const formatTime = (timestamp) => {
    return format(new Date(timestamp), "HH:mm");
  };

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
    return imageExtensions.some((ext) => fileName?.toLowerCase().endsWith(ext));
  };

  useEffect(() => {
    scrollToBottom();
  }, [uniqueMessages]);

  if (uniqueMessages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No messages yet</p>
          <p className="text-sm">Start the conversation! 💬</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {uniqueMessages.map((message) => {
        const isAIBot = message.userId?.username === "AI-Bot";
        const isCurrentUser = message.userId?.username === user?.username;

        return (
          <div
            key={`msg-${message._id}-${message.createdAt}`}
            className={`flex gap-3 p-2 rounded-lg transition-colors max-w-full ${
              isAIBot
                ? "bg-indigo-900/50"
                : isCurrentUser
                ? "bg-blue-900/30 border-l-4 border-blue-500"
                : "hover:bg-gray-800"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                isAIBot
                  ? "bg-indigo-500"
                  : isCurrentUser
                  ? "bg-blue-500"
                  : "bg-gray-600"
              }`}
            >
              {isAIBot
                ? "🤖"
                : message.userId?.username?.[0]?.toUpperCase() || "U"}
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
              {/* Header: sender + timestamp */}
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className={`font-semibold truncate ${
                    isAIBot
                      ? "text-indigo-400"
                      : isCurrentUser
                      ? "text-blue-400"
                      : "text-white"
                  }`}
                >
                  {isCurrentUser
                    ? "You"
                    : message.userId?.username || "Unknown User"}
                </span>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {formatTime(message.createdAt)}
                </span>
              </div>

              {/* Body: text or file preview */}
              <div className="text-gray-300 break-words overflow-wrap-anywhere hyphens-auto">
                {message.messageType === "file" && message.fileUrl ? (
                  <div className="max-w-full">
                    {isImageFile(message.fileName) ? (
                      <>
                        <img
                          src={`http://localhost:5000${message.fileUrl}`}
                          alt={message.fileName}
                          className="max-w-full max-h-64 rounded-lg shadow-md mb-2 object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <p className="text-sm text-gray-400 break-all">
                          {message.fileName}
                        </p>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-gray-700 rounded max-w-full">
                        <span
                          role="img"
                          aria-label="attachment"
                          className="flex-shrink-0"
                        >
                          📎
                        </span>
                        <span className="truncate">{message.fileName}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere">
                      {message.content}
                    </div>
                    <div className="mt-2">
                      <MessageReactions message={message} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
