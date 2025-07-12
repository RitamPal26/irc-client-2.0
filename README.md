# 🦖 IRC Client 2.0 - Blast from the Past

 **Classic IRC with a Modern Twist** - Built for OSDHack 2025

## 📖 About the Project

IRC Client 2.0 is a modern reimagining of the classic Internet Relay Chat (IRC) experience, built for the **OSDHack 2025** hackathon under the theme **"Blast from the Past 🦖"**. This project brings back the beloved IRC protocol with contemporary web technologies, creating a nostalgic yet cutting-edge chat experience.

### 🎯 Hackathon Details

- **Event**: OSDHack 2025
- **Theme**: Blast from the Past - Bring Back the Classics With a Modern Twist
- **Challenge**: Update old tech or ideas with a modern twist using AI, web frameworks, or anything that fits
- **Deadline**: July 12, 2025, 11:00 PM IST

## ✨ Features

### 🚀 Core Features
- **Real-time messaging** with Socket.io
- **Multi-channel support** with public and private channels
- **User authentication** with JWT tokens
- **Responsive design** for desktop and mobile
- **Dark theme** with retro-modern aesthetics
- **Message persistence** in MongoDB database

### 🎨 Modern Enhancements
- **Emoji reactions** on messages
- **Typing indicators** for active conversations
- **File sharing** capabilities
- **User online/offline status**
- **Message search** functionality
- **Custom channel creation**

### 🔧 Classic IRC Commands
- `/join #channelname` - Join a channel
- `/nick newname` - Change username
- `/msg username message` - Direct message
- `/list` - List all channels

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Frontend
- **React 19.1.0** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Zustand** - State management
- **React Router** - Navigation
- **React Hot Toast** - Notifications
- **Socket.io Client** - Real-time communication

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: MongoDB Atlas

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB database (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RitamPal26/irc-client-2.0.git
   cd irc-client-2.0
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file with:
   # MONGODB_URI=your_mongodb_connection_string
   # JWT_SECRET=your_jwt_secret_key
   # PORT=5000
   
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 📁 Project Structure

```
irc-client-2.0/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Zustand store
│   │   └── ...
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── models/             # MongoDB models
│   ├── routes/             # Express routes
│   ├── socket/             # Socket.io handlers
│   ├── middleware/         # Custom middleware
│   ├── config/             # Configuration files
│   ├── server.js           # Main server file
│   └── package.json
├── README.md
└── LICENSE
```

## 🎮 Usage

### Getting Started
1. **Register** a new account or **login** with existing credentials
2. **Browse channels** in the sidebar
3. **Join channels** by clicking on them or using `/join #channelname`
4. **Start chatting** with real-time messaging
5. **Create new channels** using the + button in the sidebar

### IRC Commands
- Type `/help` for a list of available commands
- Use classic IRC syntax for familiar operations
- Modern features accessible through UI buttons and menus

## 🌟 Demo

### Key Highlights
- **Nostalgic IRC experience** with modern UX/UI
- **Real-time messaging** between multiple users
- **Channel management** with member roles
- **File sharing** with image previews
- **Mobile-responsive** design
- **Dark theme** with retro-modern aesthetics

## 🤝 Contributing

This project is open source and contributions are welcome! Please feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Channel Endpoints
- `GET /api/channels` - Get all channels
- `POST /api/channels` - Create new channel
- `POST /api/channels/:id/join` - Join channel
- `POST /api/channels/:id/leave` - Leave channel
- `GET /api/channels/:id/messages` - Get channel messages

### Message Endpoints
- `POST /api/messages` - Send message
- `POST /api/messages/:id/react` - Add reaction

## 🔐 Security Features

- **JWT-based authentication** with secure token storage
- **Password hashing** with bcrypt
- **Input validation** and sanitization
- **CORS protection** for API endpoints
- **Helmet.js** for security headers

## 🎯 Future Enhancements

- **Voice channels** with WebRTC
- **Screen sharing** capabilities
- **Custom themes** and customization
- **Bot integration** support
- **Advanced moderation** tools
- **Message threading** for better organization

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 IRC Client 2.0

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 👨‍💻 Author

**Ritam Pal** - *Software Engineer*
- GitHub: [@RitamPal26](https://github.com/RitamPal26)
- Location: Chennai, TN, India

## 🙏 Acknowledgments

- **OSDHack 2025** for the amazing hackathon opportunity
- **Open Source Community** for the incredible tools and libraries
- **Classic IRC Protocol** for the inspiration
- **Modern Web Technologies** for making this possible

**Built with ❤️ for OSDHack 2025 - Bringing Classic IRC to the Modern Web**

*This project complies with all OSDHack 2025 requirements including open source licensing, modern technology usage, and the "Blast from the Past" theme by reimagining classic IRC with contemporary web technologies.*
