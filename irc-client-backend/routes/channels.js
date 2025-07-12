const express = require("express");
const Channel = require("../models/channel");
const Message = require("../models/message");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all channels
router.get("/", auth, async (req, res) => {
  try {
    const channels = await Channel.find({ isPrivate: false })
      .populate("createdBy", "username")
      .populate("members.user", "username isOnline")
      .sort({ createdAt: -1 });

    res.json({ channels });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new channel
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;

    const channel = new Channel({
      name,
      description,
      isPrivate: isPrivate || false,
      createdBy: req.user._id,
    });

    await channel.save();
    await channel.populate("createdBy", "username");

    res.status(201).json({
      message: "Channel created successfully",
      channel,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Channel name already exists" });
    }
    res.status(500).json({ error: error.message });
  }
});

// Join channel
router.post("/:channelId/join", auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Check if user is already a member
    const isMember = channel.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res
        .status(400)
        .json({ error: "Already a member of this channel" });
    }

    // Add user to channel
    channel.members.push({
      user: req.user._id,
      role: "member",
    });

    await channel.save();

    res.json({ message: "Successfully joined channel" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leave channel
router.post("/:channelId/leave", auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Remove user from channel
    channel.members = channel.members.filter(
      (member) => member.user.toString() !== req.user._id.toString()
    );

    await channel.save();

    res.json({ message: "Successfully left channel" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get channel messages
router.get("/:channelId/messages", auth, async (req, res) => {
  try {
    const messages = await Message.find({ channelId: req.params.channelId })
      .populate("userId", "username avatarUrl")
      .populate("reactions.users", "username") // Populate users in reactions for display
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
