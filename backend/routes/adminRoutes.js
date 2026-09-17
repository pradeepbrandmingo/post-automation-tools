import express from 'express';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Post from '../models/Post.js';
import { protect, superAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require Super Admin permissions
router.use(protect, superAdmin);

// @route   GET /api/admin/users
// @desc    Get all users with account & post stats
// @access  Super Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const usersWithStats = await Promise.all(users.map(async (u) => {
      const accountsCount = await Account.countDocuments({ userId: u._id });
      const postsCount = await Post.countDocuments({ userId: u._id });
      return {
        ...u.toObject(),
        accountsCount,
        postsCount
      };
    }));

    res.json({ success: true, users: usersWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/user/:id/data
// @desc    Super Admin fetches full profile, connected accounts, & post history of a specific user
// @access  Super Admin
router.get('/user/:id/data', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const accounts = await Account.find({ userId }).sort({ createdAt: -1 });
    const posts = await Post.find({ userId }).populate('targetAccounts').sort({ scheduledAt: -1 });

    res.json({
      success: true,
      user,
      accounts,
      posts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/user/:id/update
// @desc    Super Admin updates user details (Name, Email, Role, Status, Password)
// @access  Super Admin
router.put('/user/:id/update', async (req, res) => {
  const { name, email, role, status, password } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (status) user.status = status;
    if (password && password.trim() !== '') {
      user.password = password;
    }

    await user.save();

    res.json({
      success: true,
      message: 'User details updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/create-user
// @desc    Super Admin creates a new User with Email & Password
// @access  Super Admin
router.post('/create-user', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide Name, Email, and Password' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'user',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/user/:id/status
// @desc    Update user active/suspended status
// @access  Super Admin
router.put('/user/:id/status', async (req, res) => {
  const { status } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({ success: true, message: `User status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/user/:id/reset-password
// @desc    Reset password for a user
// @access  Super Admin
router.put('/user/:id/reset-password', async (req, res) => {
  const { newPassword } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'User password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/user/:id
// @desc    Delete user and their connected accounts/posts
// @access  Super Admin
router.delete('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    await Account.deleteMany({ userId });
    await Post.deleteMany({ userId });

    res.json({ success: true, message: 'User and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/stats
// @desc    Get Global System Stats
// @access  Super Admin
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAccounts = await Account.countDocuments();
    const totalPosts = await Post.countDocuments();
    const scheduledPosts = await Post.countDocuments({ status: 'scheduled' });
    const publishedPosts = await Post.countDocuments({ status: 'published' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAccounts,
        totalPosts,
        scheduledPosts,
        publishedPosts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
