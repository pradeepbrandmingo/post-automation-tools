import express from 'express';
import Post from '../models/Post.js';
import Account from '../models/Account.js';
import { protect } from '../middleware/authMiddleware.js';
import { processScheduledPosts } from '../services/cronService.js';

const router = express.Router();

// Protect all post routes
router.use(protect);

// @route   GET /api/posts
// @desc    Get all posts for current user (or all if Super Admin)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, limit } = req.query;
    const filter = req.user.role === 'super_admin' ? {} : { userId: req.user._id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const posts = await Post.find(filter)
      .populate('targetAccounts')
      .sort({ scheduledAt: -1 })
      .limit(parseInt(limit) || 100);

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/posts
// @desc    Create a new scheduled or immediate post
// @access  Private
router.post('/', async (req, res) => {
  const { caption, mediaUrl, mediaType, targetAccounts, scheduledAt, postNow } = req.body;

  try {
    if (!caption) {
      return res.status(400).json({ success: false, message: 'Caption text is required' });
    }
    if (!targetAccounts || targetAccounts.length === 0) {
      return res.status(400).json({ success: false, message: 'Select at least one Facebook Page or Instagram Account' });
    }

    const postDate = postNow ? new Date() : new Date(scheduledAt);

    const post = await Post.create({
      userId: req.user._id,
      caption,
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || 'none',
      targetAccounts,
      status: 'scheduled',
      scheduledAt: postDate
    });

    // If "Post Now" was clicked, run immediate publish trigger
    if (postNow) {
      await processScheduledPosts();
      const updatedPost = await Post.findById(post._id).populate('targetAccounts');
      return res.status(201).json({
        success: true,
        message: 'Post published immediately!',
        post: updatedPost
      });
    }

    const populatedPost = await Post.findById(post._id).populate('targetAccounts');

    res.status(201).json({
      success: true,
      message: 'Post scheduled successfully!',
      post: populatedPost
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/posts/:id/publish-now
// @desc    Instantly trigger publishing for a specific post
// @access  Private
router.post('/:id/publish-now', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.scheduledAt = new Date();
    post.status = 'scheduled';
    await post.save();

    await processScheduledPosts();
    const updatedPost = await Post.findById(post._id).populate('targetAccounts');

    res.json({
      success: true,
      message: 'Post trigger completed',
      post: updatedPost
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/posts/run-scheduler-manual
// @desc    Manually execute cron publisher check
// @access  Private
router.post('/run-scheduler-manual', async (req, res) => {
  try {
    const result = await processScheduledPosts();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a scheduled post
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const filter = req.user.role === 'super_admin' ? { _id: req.params.id } : { _id: req.params.id, userId: req.user._id };
    const post = await Post.findOne(filter);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    await Post.findByIdAndDelete(post._id);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
