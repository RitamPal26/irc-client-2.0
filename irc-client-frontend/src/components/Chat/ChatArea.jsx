import { useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import useStore from '../../store/useStore';
import TypingIndicator from './TypingIndicator';

const ChatArea = ({ channel }) => {
  const { messages } = useStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Channel Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <h2 className="text-lg font-semibold">#{channel.name}</h2>
        <p className="text-sm text-gray-400">{channel.description}</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700">
        <TypingIndicator />
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatArea;
