const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Message = require('../models/message');
const Channel = require('../models/channel');

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('Authentication error'));
    }
    
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

const handleConnection = (io) => {
  io.use(socketAuth);

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Update user online status
    await User.findByIdAndUpdate(socket.user._id, { 
      isOnline: true,
      lastSeen: new Date()
    });

    // Join user to their channels
    const userChannels = await Channel.find({
      'members.user': socket.user._id
    });

    userChannels.forEach(channel => {
      socket.join(channel._id.toString());
    });

    // Handle joining a channel
    socket.on('join-channel', async (channelId) => {
      try {
        const channel = await Channel.findById(channelId);
        if (channel) {
          socket.join(channelId);
          socket.to(channelId).emit('user-joined', {
            user: socket.user.username,
            message: `${socket.user.username} joined the channel`
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to join channel' });
      }
    });

    // Handle leaving a channel
    socket.on('leave-channel', (channelId) => {
      socket.leave(channelId);
      socket.to(channelId).emit('user-left', {
        user: socket.user.username,
        message: `${socket.user.username} left the channel`
      });
    });

    // Handle sending messages
    socket.on('send-message', async (data) => {
      try {
        const { channelId, content, messageType = 'text' } = data;

        // Verify user is member of channel
        const channel = await Channel.findById(channelId);
        const isMember = channel.members.some(
          member => member.user.toString() === socket.user._id.toString()
        );

        if (!isMember) {
          socket.emit('error', { message: 'Not a member of this channel' });
          return;
        }

        const message = new Message({
          channelId,
          userId: socket.user._id,
          content,
          messageType
        });

        await message.save();
        await message.populate('userId', 'username avatarUrl');

        // Broadcast message to channel
        io.to(channelId).emit('new-message', message);

        // Update channel message count
        channel.messageCount += 1;
        await channel.save();

      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      socket.to(data.channelId).emit('user-typing', {
        user: socket.user.username,
        channelId: data.channelId
      });
    });

    socket.on('typing-stop', (data) => {
      socket.to(data.channelId).emit('user-stop-typing', {
        user: socket.user.username,
        channelId: data.channelId
      });
    });

    // Handle message reactions
    socket.on('add-reaction', async (data) => {
      try {
        const { messageId, emoji } = data;
        const message = await Message.findById(messageId);

        if (!message) return;

        const existingReaction = message.reactions.find(r => r.emoji === emoji);

        if (existingReaction) {
          const userIndex = existingReaction.users.indexOf(socket.user._id);
          if (userIndex === -1) {
            existingReaction.users.push(socket.user._id);
          }
        } else {
          message.reactions.push({
            emoji,
            users: [socket.user._id]
          });
        }

        await message.save();

        io.to(message.channelId.toString()).emit('reaction-added', {
          messageId,
          emoji,
          user: socket.user.username
        });

      } catch (error) {
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected`);
      
      // Update user offline status
      await User.findByIdAndUpdate(socket.user._id, { 
        isOnline: false,
        lastSeen: new Date()
      });

      // Notify channels about user going offline
      userChannels.forEach(channel => {
        socket.to(channel._id.toString()).emit('user-offline', {
          user: socket.user.username
        });
      });
    });
  });
};

module.exports = { handleConnection };
