import { useState } from 'react';
import { Send } from 'lucide-react';
import useStore from '../../store/useStore';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const { sendMessage, currentChannel } = useStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || !currentChannel) return;

    sendMessage(message.trim());
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={`Message #${currentChannel?.name || 'channel'}`}
        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        maxLength={2000}
      />
      <button
        type="submit"
        disabled={!message.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={18} />
      </button>
    </form>
  );
};

export default MessageInput;
