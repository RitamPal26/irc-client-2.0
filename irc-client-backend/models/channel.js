const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 1,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 200,
    default: ''
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  messageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add creator as admin when channel is created
channelSchema.pre('save', function(next) {
  if (this.isNew) {
    this.members.push({
      user: this.createdBy,
      role: 'admin',
      joinedAt: new Date()
    });
  }
  next();
});

// Safe export that checks if model exists
module.exports = mongoose.models.Channel || mongoose.model('Channel', channelSchema);

