import { formatDistanceToNow } from "date-fns";

const MessageList = ({ messages }) => {
  if (!messages || messages.length === 0) {
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
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message._id}
          className="flex gap-3 hover:bg-gray-800 p-2 rounded"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
            {message.userId?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-semibold text-white">
                {message.userId?.username || "Unknown User"}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-gray-300 break-words whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
