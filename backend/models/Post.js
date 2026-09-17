import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  caption: {
    type: String,
    required: true,
    trim: true
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'none'],
    default: 'none'
  },
  targetAccounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed'],
    default: 'scheduled',
    index: true
  },
  scheduledAt: {
    type: Date,
    required: true,
    index: true
  },
  publishedAt: {
    type: Date,
    default: null
  },
  publishResults: [{
    accountId: String,
    accountName: String,
    platform: String,
    status: String,
    metaPostId: String,
    error: String,
    publishedAt: Date
  }]
}, {
  timestamps: true
});

export default mongoose.model('Post', postSchema);
