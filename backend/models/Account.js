import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  platform: {
    type: String,
    enum: ['facebook', 'instagram', 'both'],
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  facebookPageId: {
    type: String,
    default: null
  },
  facebookPageName: {
    type: String,
    default: null
  },
  instagramAccountId: {
    type: String,
    default: null
  },
  instagramUsername: {
    type: String,
    default: null
  },
  // For Instagram-only accounts (connected via Instagram Login API directly)
  instagramAccessToken: {
    type: String,
    default: null
  },
  accessToken: {
    type: String,
    required: true
  },
  tokenExpiresAt: {
    type: Date,
    default: null
  },
  avatarUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=150&q=80'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Account', accountSchema);
