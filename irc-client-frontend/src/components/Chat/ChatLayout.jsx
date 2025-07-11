import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import UserList from './UserList';
import { channelsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ChatLayout = () => {
  const { 
    isAuthenticated, 
    token, 
    user, 
    channels, 
    setChannels, 
    currentChannel,
    connectSocket 
  } = useStore();
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Connect socket if not connected
    connectSocket(token);

    // Load channels
    loadChannels();
  }, [isAuthenticated, token]);

  const loadChannels = async () => {
    try {
      const response = await channelsAPI.getChannels();
      setChannels(response.data.channels);
    } catch (error) {
      toast.error('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !token) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading IRC 2.0...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 flex-shrink-0">
        <Sidebar channels={channels} onRefresh={loadChannels} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChannel ? (
          <ChatArea channel={currentChannel} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome to IRC 2.0</h2>
              <p className="text-gray-400">Select a channel to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* User List */}
      {currentChannel && (
        <div className="w-48 bg-gray-800 flex-shrink-0">
          <UserList channel={currentChannel} />
        </div>
      )}
    </div>
  );
};

export default ChatLayout;
