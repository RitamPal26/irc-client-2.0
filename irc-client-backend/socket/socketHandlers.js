const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Message = require("../models/message");
const Channel = require("../models/channel");

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error("Authentication error"));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
};

const updateChannelMemberCount = (io, channelName) => {
  const room = io.sockets.adapter.rooms.get(channelName);
  const memberCount = room ? room.size : 0;

  io.to(channelName).emit("channel-member-count", {
    channelName,
    memberCount,
  });
};

const handleConnection = (io) => {
  io.use(socketAuth);

  io.on("connection", async (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Update user online status
    await User.findByIdAndUpdate(socket.user._id, {
      isOnline: true,
      lastSeen: new Date(),
    });

    // Join user to their channels
    const userChannels = await Channel.find({
      "members.user": socket.user._id,
    });

    userChannels.forEach((channel) => {
      socket.join(channel._id.toString());
    });

    // Handle joining a channel
    socket.on("join-channel", async (channelId) => {
      try {
        const channel = await Channel.findById(channelId);
        if (channel) {
          socket.join(channelId);
          socket.to(channelId).emit("user-joined", {
            user: socket.user.username,
            message: `${socket.user.username} joined the channel`,
          });
          updateChannelMemberCount(io, channelId);
        }
      } catch (error) {
        socket.emit("error", { message: "Failed to join channel" });
      }
    });

    // Handle leaving a channel
    socket.on("leave-channel", (channelId) => {
      socket.leave(channelId);
      socket.to(channelId).emit("user-left", {
        user: socket.user.username,
        message: `${socket.user.username} left the channel`,
      });
      updateChannelMemberCount(io, channelId);
    });

    // Handle sending messages
    socket.on("send-message", async (data) => {
      try {
        const { channelId, content, messageType = "text" } = data;
        console.log(`📤 Message from ${socket.user.username}:`, data);

        // Verify channel exists
        const channel = await Channel.findById(channelId);
        if (!channel) {
          console.error(`❌ Channel ${channelId} not found`);
          socket.emit("error", { message: "Channel not found" });
          return;
        }

        // Check if user is member - with better logging
        const isMember = channel.members.some(
          (member) => member.user.toString() === socket.user._id.toString()
        );

        if (!isMember) {
          console.error(
            `❌ User ${socket.user.username} not a member of channel ${channel.name}`
          );
          console.log(
            `📋 Channel members:`,
            channel.members.map((m) => m.user)
          );
          console.log(`👤 User ID:`, socket.user._id);

          // Auto-add user to public channels as fallback
          if (!channel.isPrivate) {
            console.log(
              `🔧 Auto-adding user to public channel ${channel.name}`
            );
            channel.members.push({
              user: socket.user._id,
              role: "member",
            });
            await channel.save();
          } else {
            socket.emit("error", { message: "Not a member of this channel" });
            return;
          }
        }

        // Create and save message
        const message = new Message({
          channelId,
          userId: socket.user._id,
          content,
          messageType,
        });

        await message.save();
        await message.populate("userId", "username avatarUrl");

        console.log(`✅ Broadcasting message to channel ${channel.name}`);

        // Broadcast message to all users in the channel
        io.to(channelId).emit("new-message", message);
      } catch (error) {
        console.error("❌ Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing-start", (data) => {
      socket.to(data.channelId).emit("user-typing", {
        user: socket.user.username,
        channelId: data.channelId,
      });
    });

    socket.on("typing-stop", (data) => {
      socket.to(data.channelId).emit("user-stop-typing", {
        user: socket.user.username,
        channelId: data.channelId,
      });
    });

    // Handle message reactions
    socket.on("add-reaction", async (data) => {
      try {
        const { messageId, emoji, userId } = data;
        const message = await Message.findById(messageId);

        if (!message) return;

        // Find existing reaction
        let existingReaction = message.reactions.find((r) => r.emoji === emoji);

        if (existingReaction) {
          // Toggle user's reaction
          const userIndex = existingReaction.users.indexOf(userId);
          if (userIndex > -1) {
            existingReaction.users.splice(userIndex, 1);
            if (existingReaction.users.length === 0) {
              message.reactions = message.reactions.filter(
                (r) => r.emoji !== emoji
              );
            }
          } else {
            existingReaction.users.push(userId);
          }
        } else {
          // Add new reaction
          message.reactions.push({
            emoji,
            users: [userId],
          });
        }

        await message.save();

        // Broadcast reaction update
        io.to(data.channelId).emit("reaction-updated", {
          messageId,
          reactions: message.reactions,
        });
      } catch (error) {
        console.error("Error handling reaction:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`User ${socket.user.username} disconnected`);

      // Update user offline status
      await User.findByIdAndUpdate(socket.user._id, {
        isOnline: false,
        lastSeen: new Date(),
      });

      // Update member count for all rooms user was in
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          updateChannelMemberCount(io, room);
        }
      });

      // Notify channels about user going offline
      userChannels.forEach((channel) => {
        socket.to(channel._id.toString()).emit("user-offline", {
          user: socket.user.username,
        });
      });
    });
  });
};

module.exports = { handleConnection };
