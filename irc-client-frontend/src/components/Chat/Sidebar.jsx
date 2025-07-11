import { useState } from 'react';
import { Hash, Plus, Settings, LogOut } from 'lucide-react';
import useStore from '../../store/useStore';
import { channelsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Sidebar = ({ channels, onRefresh }) => {
  const { user, logout, currentChannel, setCurrentChannel, socket } = useStore();
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  const handleChannelSelect = async (channel) => {
    setCurrentChannel(channel);
    
    // Join channel via socket
    if (socket) {
      socket.emit('join-channel', channel._id);
    }

    // Load messages for this channel
    try {
      const response = await channelsAPI.getMessages(channel._id);
      useStore.getState().setMessages(response.data.messages);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      await channelsAPI.createChannel({
        name: newChannelName.trim(),
        description: `Channel created by ${user.username}`
      });
      
      setNewChannelName('');
      setShowCreateChannel(false);
      onRefresh();
      toast.success('Channel created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create channel');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">IRC 2.0</h1>
        <p className="text-sm text-gray-400">Welcome, {user?.username}</p>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-300 uppercase">Channels</h2>
            <button
              onClick={() => setShowCreateChannel(true)}
              className="text-gray-400 hover:text-white"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Create Channel Form */}
          {showCreateChannel && (
            <form onSubmit={handleCreateChannel} className="mb-3">
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="Channel name"
                className="w-full px-2 py-1 text-sm bg-gray-700 rounded border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-1 mt-1">
                <button
                  type="submit"
                  className="px-2 py-1 text-xs bg-blue-600 rounded hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateChannel(false)}
                  className="px-2 py-1 text-xs bg-gray-600 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Channel List */}
          <div className="space-y-1">
            {channels.map((channel) => (
              <button
                key={channel._id}
                onClick={() => handleChannelSelect(channel)}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left hover:bg-gray-700 ${
                  currentChannel?._id === channel._id ? 'bg-gray-700' : ''
                }`}
              >
                <Hash size={16} className="text-gray-400" />
                <span className="text-sm">{channel.name}</span>
                <span className="text-xs text-gray-500 ml-auto">
                  {channel.messageCount || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm">{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
