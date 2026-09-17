import Post from '../models/Post.js';
import Account from '../models/Account.js';
import { publishToFacebookPage, publishToInstagramBusiness } from './metaService.js';

/**
 * Core Auto-Publisher Function (Triggered by Cron or Firebase Cloud Scheduler)
 */
const processScheduledPosts = async () => {
  const now = new Date();
  console.log(`[${now.toISOString()}] 🔍 Checking for scheduled posts due for publishing...`);

  try {
    const duePosts = await Post.find({
      status: 'scheduled',
      scheduledAt: { $lte: now }
    }).populate('targetAccounts');

    if (duePosts.length === 0) {
      return { processed: 0, message: 'No posts due' };
    }

    console.log(`🚀 Found ${duePosts.length} posts due for publishing.`);

    for (const post of duePosts) {
      const publishResults = [];
      let overallSuccess = true;

      for (const account of post.targetAccounts) {
        if (!account.isActive) {
          publishResults.push({
            accountId: account._id,
            accountName: account.accountName,
            platform: account.platform,
            status: 'failed',
            error: 'Account is inactive or disconnected',
            publishedAt: new Date()
          });
          overallSuccess = false;
          continue;
        }

        // Publish to Facebook Page
        if (account.platform === 'facebook' || account.platform === 'both') {
          const fbRes = await publishToFacebookPage({
            pageId: account.facebookPageId,
            pageAccessToken: account.accessToken,
            caption: post.caption,
            mediaUrl: post.mediaUrl
          });

          publishResults.push({
            accountId: account._id,
            accountName: `${account.facebookPageName} (FB Page)`,
            platform: 'facebook',
            status: fbRes.success ? 'published' : 'failed',
            metaPostId: fbRes.metaPostId || null,
            error: fbRes.error || null,
            publishedAt: new Date()
          });

          if (!fbRes.success) overallSuccess = false;
        }

        // Publish to Instagram Business Account
        if ((account.platform === 'instagram' || account.platform === 'both') && account.instagramAccountId) {
          const igRes = await publishToInstagramBusiness({
            igUserId: account.instagramAccountId,
            pageAccessToken: account.accessToken,
            caption: post.caption,
            mediaUrl: post.mediaUrl
          });

          publishResults.push({
            accountId: account._id,
            accountName: `@${account.instagramUsername || account.accountName} (Instagram)`,
            platform: 'instagram',
            status: igRes.success ? 'published' : 'failed',
            metaPostId: igRes.metaPostId || null,
            error: igRes.error || null,
            publishedAt: new Date()
          });

          if (!igRes.success) overallSuccess = false;
        }
      }

      // Update post status
      post.status = overallSuccess ? 'published' : 'failed';
      post.publishedAt = new Date();
      post.publishResults = publishResults;
      await post.save();

      console.log(`✅ Processed Post ID ${post._id}: Final Status = ${post.status}`);
    }

    return { processed: duePosts.length, success: true };
  } catch (error) {
    console.error('❌ Error processing scheduled posts:', error.message);
    return { success: false, error: error.message };
  }
};

export { processScheduledPosts };
