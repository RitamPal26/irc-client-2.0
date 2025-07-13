const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const connectDB = require("./config/database");
const { handleConnection } = require("./socket/socketHandlers");

// Import models at the top
const Channel = require("./models/Channel");
const User = require("./models/User");

// Import routes
const authRoutes = require("./routes/auth");
const channelRoutes = require("./routes/channels");
const messageRoutes = require("./routes/messages");
const uploadRoutes = require('./routes/upload');

const app = express();
const aiRoutes = require('./routes/ai')
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes); // Use the AI routes

// Socket.io connection handling
handleConnection(io);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

// Default channels creation function
const createDefaultChannels = async () => {
  // Remove the require statements from here
  try {
    const channelCount = await Channel.countDocuments();
    if (channelCount === 0) {
      // Find first admin user or create system user
      let adminUser = await User.findOne({});
      if (!adminUser) {
        adminUser = new User({
          username: "system",
          email: "system@irc20.dev",
          passwordHash: "system123",
        });
        await adminUser.save();
      }

      // Create default channels
      const defaultChannels = [
        { name: "general", description: "General discussion for everyone" },
        { name: "random", description: "Random conversations and fun" },
        { name: "tech-talk", description: "Technical discussions and coding" },
        { name: "osdhack2025", description: "OSDHack 2025 discussions" },
      ];

      for (const channelData of defaultChannels) {
        const channel = new Channel({
          ...channelData,
          createdBy: adminUser._id,
          isPrivate: false,
        });
        await channel.save();
      }

      console.log("✅ Default channels created");
    }
  } catch (error) {
    console.error("Error creating default channels:", error);
  }
};

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    console.log("📄 Database connected");

    // Create default channels
    await createDefaultChannels();

    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Frontend URL: http://localhost:5173`);
      console.log(`🔗 Backend URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the application
startServer();
