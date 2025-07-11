const express = require('express');
const Message = require('../models/message');
const Channel = require('../models/channel');
const auth = require('../middleware/auth');

const router = express.Router();

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { channelId, content, messageType = 'text' } = req.body;

    // Verify user is member of channel
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const isMember = channel.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this channel' });
    }

    const message = new Message({
      channelId,
      userId: req.user._id,
      content,
      messageType
    });

    await message.save();
    await message.populate('userId', 'username avatarUrl');

    // Update channel message count
    channel.messageCount += 1;
    await channel.save();

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add reaction to message
router.post('/:messageId/react', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Find existing reaction
    const existingReaction = message.reactions.find(r => r.emoji === emoji);

    if (existingReaction) {
      // Toggle user's reaction
      const userIndex = existingReaction.users.indexOf(req.user._id);
      if (userIndex > -1) {
        existingReaction.users.splice(userIndex, 1);
        if (existingReaction.users.length === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        existingReaction.users.push(req.user._id);
      }
    } else {
      // Add new reaction
      message.reactions.push({
        emoji,
        users: [req.user._id]
      });
    }

    await message.save();

    res.json({ message: 'Reaction updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
