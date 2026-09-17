import express from 'express';
import jwt from 'jsonwebtoken';
import Account from '../models/Account.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { exchangeShortToLongToken, getUserPagesAndInstagram, exchangeInstagramCode, getInstagramUserInfo, getInstagramLongLivedToken } from '../services/metaService.js';

const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const IG_APP_ID = process.env.IG_APP_ID;
const IG_APP_SECRET = process.env.IG_APP_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || 'https://post-automation-tools.onrender.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://post-automation-tools.vercel.app';

const router = express.Router();

// ─── SERVER-SIDE OAUTH ROUTES (Public — no protect middleware) ──────────────

// @route   GET /api/accounts/meta-initiate
// @desc    Start Meta OAuth (server-side code flow) — redirects browser to Facebook
// @access  Public (JWT passed as query param)
router.get('/meta-initiate', (req, res) => {
  const { platform, authToken } = req.query;

  const scope = platform === 'instagram'
    ? 'public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,instagram_content_publish,instagram_basic,business_management'
    : 'public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,business_management';

  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  
  // Use BACKEND_URL from env if set, otherwise fallback to current host
  const backendUrl = process.env.BACKEND_URL || `${protocol}://${host}`;
  const frontendUrl = req.headers.referer 
    ? new URL(req.headers.referer).origin 
    : (process.env.FRONTEND_URL || 'http://localhost:5173');

  const callbackUri = `${backendUrl}/api/accounts/meta-callback`;
  const state = Buffer.from(JSON.stringify({ authToken, platform: platform || 'facebook', callbackUri, frontendUrl })).toString('base64url');

  const metaUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(callbackUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${state}&auth_type=rerequest`;

  res.redirect(metaUrl);
});

// @route   GET /api/accounts/meta-callback
// @desc    Handle Meta OAuth callback — exchange code for token, save accounts
// @access  Public
router.get('/meta-callback', async (req, res) => {
  const { code, state, error } = req.query;

  let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  let callbackUri = `${process.env.BACKEND_URL || `${protocol}://${host}`}/api/accounts/meta-callback`;
  let authToken = null;

  try {
    if (state) {
      const decodedState = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
      if (decodedState.frontendUrl) frontendUrl = decodedState.frontendUrl;
      if (decodedState.callbackUri) callbackUri = decodedState.callbackUri;
      if (decodedState.authToken) authToken = decodedState.authToken;
    }
  } catch (e) {
    console.error('State parse error:', e.message);
  }

  if (error) {
    return res.redirect(`${frontendUrl}/accounts?oauth_error=${encodeURIComponent(error)}`);
  }

  try {
    if (!authToken) {
      return res.redirect(`${frontendUrl}/accounts?oauth_error=missing_auth_token`);
    }

    // Verify JWT → get user
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.redirect(`${frontendUrl}/accounts?oauth_error=user_not_found`);

    // Exchange auth code for access token using exact callbackUri
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(callbackUri)}&client_secret=${META_APP_SECRET}&code=${code}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return res.redirect(`${frontendUrl}/accounts?oauth_error=${encodeURIComponent(tokenData.error.message)}`);
    }

    // Exchange short-lived → long-lived token
    const longLivedRes = await exchangeShortToLongToken(tokenData.access_token);
    const longLivedToken = longLivedRes.access_token;

    // Fetch Facebook Pages & Instagram Business Accounts
    const pages = await getUserPagesAndInstagram(longLivedToken);
    console.log('📄 Meta returned pages count:', pages.length);
    console.log('📄 Meta pages detail:', JSON.stringify(pages, null, 2));

    if (pages.length === 0) {
      console.warn('⚠️ No pages returned by Meta Graph API');
      return res.redirect(`${frontendUrl}/accounts?oauth_error=no_pages`);
    }

    // Save accounts to DB
    for (const page of pages) {
      const fbPageId = page.id;
      const fbPageName = page.name;
      const pageAccessToken = page.access_token;
      const ig = page.instagram_business_account;

      // Save / Update Facebook Page
      const fbExists = await Account.findOne({ userId: user._id, facebookPageId: fbPageId, platform: 'facebook' });
      if (fbExists) {
        fbExists.accessToken = pageAccessToken;
        await fbExists.save();
      } else {
        await Account.create({
          userId: user._id,
          platform: 'facebook',
          accountName: `${fbPageName} (Facebook Page)`,
          facebookPageId: fbPageId,
          facebookPageName: fbPageName,
          accessToken: pageAccessToken,
          avatarUrl: page?.picture?.data?.url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=150&q=80'
        });
      }

      // Save / Update Instagram Business Account (if linked)
      if (ig && ig.username) {
        const igExists = await Account.findOne({ userId: user._id, instagramAccountId: ig.id, platform: 'instagram' });
        if (igExists) {
          igExists.accessToken = pageAccessToken;
          await igExists.save();
        } else {
          await Account.create({
            userId: user._id,
            platform: 'instagram',
            accountName: `@${ig.username} (Instagram)`,
            facebookPageId: fbPageId,
            facebookPageName: fbPageName,
            instagramAccountId: ig.id,
            instagramUsername: ig.username,
            accessToken: pageAccessToken,
            avatarUrl: ig.profile_picture_url || 'https://images.unsplash.com/photo-1611262588024-d12430b98920?auto=format&fit=crop&w=150&q=80'
          });
        }
      }
    }

    // Redirect back to frontend with success
    res.redirect(`${frontendUrl}/accounts?oauth_success=true`);
  } catch (err) {
    console.error('Meta OAuth callback error:', err.message);
    res.redirect(`${frontendUrl}/accounts?oauth_error=${encodeURIComponent(err.message)}`);
  }
});

// ─── INSTAGRAM DIRECT OAUTH ROUTES (Instagram Login API) ────────────────────

// @route   GET /api/accounts/instagram-initiate
// @desc    Start Instagram Direct OAuth — opens instagram.com login
// @access  Public (JWT passed as query param)
router.get('/instagram-initiate', (req, res) => {
  const { authToken } = req.query;

  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  const backendUrl = process.env.BACKEND_URL || `${protocol}://${host}`;
  const frontendUrl = req.headers.referer
    ? new URL(req.headers.referer).origin
    : (process.env.FRONTEND_URL || 'http://localhost:5173');

  const callbackUri = `${backendUrl}/api/accounts/instagram-callback`;
  const state = Buffer.from(JSON.stringify({ authToken, callbackUri, frontendUrl })).toString('base64url');

  const scope = 'instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_comments';

  const igUrl = `https://api.instagram.com/oauth/authorize?client_id=${IG_APP_ID}&redirect_uri=${encodeURIComponent(callbackUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${state}`;

  res.redirect(igUrl);
});

// @route   GET /api/accounts/instagram-callback
// @desc    Handle Instagram OAuth callback — exchange code for token, save account
// @access  Public
router.get('/instagram-callback', async (req, res) => {
  const { code, state, error } = req.query;

  let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  let callbackUri = `${process.env.BACKEND_URL || `${protocol}://${host}`}/api/accounts/instagram-callback`;
  let authToken = null;

  try {
    if (state) {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
      if (decoded.frontendUrl) frontendUrl = decoded.frontendUrl;
      if (decoded.callbackUri) callbackUri = decoded.callbackUri;
      if (decoded.authToken) authToken = decoded.authToken;
    }
  } catch (e) {
    console.error('Instagram state parse error:', e.message);
  }

  if (error) {
    return res.redirect(`${frontendUrl}/accounts?oauth_error=${encodeURIComponent(error)}`);
  }

  try {
    if (!authToken) {
      return res.redirect(`${frontendUrl}/accounts?oauth_error=missing_auth_token`);
    }

    // Verify JWT → get user
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.redirect(`${frontendUrl}/accounts?oauth_error=user_not_found`);

    // Exchange code for short-lived token & user_id
    const tokenResult = await exchangeInstagramCode({ code, callbackUri, appId: IG_APP_ID, appSecret: IG_APP_SECRET });
    const shortToken = typeof tokenResult === 'string' ? tokenResult : tokenResult.accessToken;
    const initialUserId = tokenResult?.userId;
    const initialUsername = tokenResult?.username;

    // Exchange for long-lived token (60 days) with safe fallback
    const longToken = await getInstagramLongLivedToken({ shortToken, appSecret: IG_APP_SECRET });

    // Get Instagram user info with safe fallback
    const igUser = await getInstagramUserInfo(longToken || shortToken, initialUserId, initialUsername);

    console.log('📸 Instagram user info:', igUser);

    if (!igUser || !igUser.id) {
      return res.redirect(`${frontendUrl}/accounts?oauth_error=instagram_user_not_found`);
    }

    // Save or update Instagram account in DB
    const existingIg = await Account.findOne({ userId: user._id, instagramAccountId: igUser.id, platform: 'instagram' });

    if (existingIg) {
      existingIg.instagramAccessToken = longToken;
      existingIg.accessToken = longToken;
      existingIg.accountName = `@${igUser.username} (Instagram)`;
      existingIg.instagramUsername = igUser.username;
      if (igUser.profile_picture_url) existingIg.avatarUrl = igUser.profile_picture_url;
      await existingIg.save();
    } else {
      await Account.create({
        userId: user._id,
        platform: 'instagram',
        accountName: `@${igUser.username} (Instagram)`,
        instagramAccountId: igUser.id,
        instagramUsername: igUser.username,
        instagramAccessToken: longToken,
        accessToken: longToken,
        avatarUrl: igUser.profile_picture_url || 'https://images.unsplash.com/photo-1611262588024-d12430b98920?auto=format&fit=crop&w=150&q=80'
      });
    }

    res.redirect(`${frontendUrl}/accounts?oauth_success=true&platform=instagram`);
  } catch (err) {
    console.error('Instagram OAuth callback error:', err.message);
    res.redirect(`${frontendUrl}/accounts?oauth_error=${encodeURIComponent(err.message)}`);
  }
});

// ─── PROTECTED ROUTES ────────────────────────────────────────────────────────

// Protect all account routes below
router.use(protect);

// @route   GET /api/accounts
// @desc    Get all connected Meta accounts for current user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const filter = req.user.role === 'super_admin' ? {} : { userId: req.user._id };
    const accounts = await Account.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/accounts/connect-meta
// @desc    Exchange short-lived Meta user access token & store Facebook Pages AND Instagram accounts as separate cards
// @access  Private
router.post('/connect-meta', async (req, res) => {
  const { shortLivedToken } = req.body;

  try {
    if (!shortLivedToken) {
      return res.status(400).json({ success: false, message: 'Meta short-lived token required' });
    }

    // 1. Exchange short-lived token for long-lived token
    const tokenRes = await exchangeShortToLongToken(shortLivedToken);
    const longLivedToken = tokenRes.access_token;

    // 2. Fetch Facebook Pages & Linked Instagram Accounts
    const pages = await getUserPagesAndInstagram(longLivedToken);

    if (pages.length === 0) {
      return res.status(400).json({ success: false, message: 'No Facebook Pages found associated with this Meta account.' });
    }

    const savedAccounts = [];

    for (const page of pages) {
      const fbPageId = page.id;
      const fbPageName = page.name;
      const pageAccessToken = page.access_token;
      const ig = page.instagram_business_account;

      // 1. Save / Update Facebook Page Account Card
      let fbAccount = await Account.findOne({
        userId: req.user._id,
        facebookPageId: fbPageId,
        platform: 'facebook'
      });

      if (fbAccount) {
        fbAccount.accessToken = pageAccessToken;
        fbAccount.accountName = `${fbPageName} (Facebook Page)`;
        fbAccount.facebookPageName = fbPageName;
        await fbAccount.save();
        savedAccounts.push(fbAccount);
      } else {
        fbAccount = await Account.create({
          userId: req.user._id,
          platform: 'facebook',
          accountName: `${fbPageName} (Facebook Page)`,
          facebookPageId: fbPageId,
          facebookPageName: fbPageName,
          accessToken: pageAccessToken,
          avatarUrl: page?.picture?.data?.url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=150&q=80'
        });
        savedAccounts.push(fbAccount);
      }

      // 2. Save / Update Instagram Business Account Card (If linked to Page)
      if (ig && ig.username) {
        let igAccount = await Account.findOne({
          userId: req.user._id,
          instagramAccountId: ig.id,
          platform: 'instagram'
        });

        if (igAccount) {
          igAccount.accessToken = pageAccessToken;
          igAccount.accountName = `@${ig.username} (Instagram)`;
          igAccount.instagramUsername = ig.username;
          igAccount.facebookPageId = fbPageId;
          if (ig.profile_picture_url) igAccount.avatarUrl = ig.profile_picture_url;
          await igAccount.save();
          savedAccounts.push(igAccount);
        } else {
          igAccount = await Account.create({
            userId: req.user._id,
            platform: 'instagram',
            accountName: `@${ig.username} (Instagram)`,
            facebookPageId: fbPageId,
            facebookPageName: fbPageName,
            instagramAccountId: ig.id,
            instagramUsername: ig.username,
            accessToken: pageAccessToken,
            avatarUrl: ig.profile_picture_url || 'https://images.unsplash.com/photo-1611262588024-d12430b98920?auto=format&fit=crop&w=150&q=80'
          });
          savedAccounts.push(igAccount);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully connected ${savedAccounts.length} Meta account(s)!`,
      accounts: savedAccounts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/accounts/mock-connect
// @desc    Connect Facebook Page & Instagram Account as separate cards
// @access  Private
router.post('/mock-connect', async (req, res) => {
  try {
    const { pageName, instagramUsername, platform } = req.body;

    const mockPageId = 'fb_page_' + Math.floor(100000 + Math.random() * 900000);
    const mockIgId = 'ig_biz_' + Math.floor(100000 + Math.random() * 900000);
    const pageAccessToken = 'EAA_LONG_LIVED_PAGE_ACCESS_TOKEN_' + Date.now();

    const createdAccounts = [];

    // Create Facebook Page Card if requested
    if (platform === 'facebook' || platform === 'both') {
      const fbAcc = await Account.create({
        userId: req.user._id,
        platform: 'facebook',
        accountName: `${pageName || 'Brand Facebook Page'}`,
        facebookPageId: mockPageId,
        facebookPageName: pageName || 'Brand Facebook Page',
        accessToken: pageAccessToken,
        avatarUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=150&q=80'
      });
      createdAccounts.push(fbAcc);
    }

    // Create Instagram Account Card if requested
    if (platform === 'instagram' || platform === 'both') {
      const igAcc = await Account.create({
        userId: req.user._id,
        platform: 'instagram',
        accountName: `@${instagramUsername || 'brand_official'}`,
        facebookPageId: mockPageId,
        facebookPageName: pageName || 'Brand Facebook Page',
        instagramAccountId: mockIgId,
        instagramUsername: instagramUsername || 'brand_official',
        accessToken: pageAccessToken,
        avatarUrl: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?auto=format&fit=crop&w=150&q=80'
      });
      createdAccounts.push(igAcc);
    }

    res.status(201).json({
      success: true,
      message: `Successfully connected ${createdAccounts.length} account(s)!`,
      accounts: createdAccounts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/accounts/:id
// @desc    Disconnect/Delete account
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const filter = req.user.role === 'super_admin' ? { _id: req.params.id } : { _id: req.params.id, userId: req.user._id };
    const account = await Account.findOne(filter);

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    await Account.findByIdAndDelete(account._id);
    res.json({ success: true, message: 'Account disconnected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
