import axios from 'axios';

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v19.0';
const BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Exchange short-lived Facebook User Access Token for 60-Day Long-Lived Token
 */
const exchangeShortToLongToken = async (shortLivedToken) => {
  try {
    const response = await axios.get(`${BASE_URL}/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.META_APP_ID || process.env.VITE_META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        fb_exchange_token: shortLivedToken
      }
    });
    return response.data;
  } catch (error) {
    console.error('Meta Token Exchange Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to exchange Meta access token');
  }
};

/**
 * Fetch connected Facebook Pages & Instagram Business Accounts for an Access Token
 */
const getUserPagesAndInstagram = async (userAccessToken) => {
  try {
    const response = await axios.get(`${BASE_URL}/me/accounts`, {
      params: {
        fields: 'id,name,access_token,category,picture,instagram_business_account{id,username,profile_picture_url}',
        access_token: userAccessToken
      }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Meta Get Pages Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to fetch Facebook Pages & Instagram accounts');
  }
};

/**
 * Publish Post to Facebook Page
 */
const publishToFacebookPage = async ({ pageId, pageAccessToken, caption, mediaUrl }) => {
  try {
    let endpoint = `${BASE_URL}/${pageId}/feed`;
    let params = {
      message: caption,
      access_token: pageAccessToken
    };

    // If media URL is provided, publish as photo
    if (mediaUrl) {
      endpoint = `${BASE_URL}/${pageId}/photos`;
      params = {
        caption: caption,
        url: mediaUrl,
        access_token: pageAccessToken
      };
    }

    const response = await axios.post(endpoint, null, { params });
    return {
      success: true,
      metaPostId: response.data.id || response.data.post_id
    };
  } catch (error) {
    console.error(`Facebook Page Post Error (${pageId}):`, error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};

/**
 * Publish Post to Instagram Business Account (2-Step Container Workflow)
 */
const publishToInstagramBusiness = async ({ igUserId, pageAccessToken, caption, mediaUrl }) => {
  try {
    if (!igUserId) {
      throw new Error('No Instagram Business Account linked to this Facebook Page');
    }
    if (!mediaUrl) {
      throw new Error('Instagram requires an image or video URL for posts');
    }

    // Format URL for Instagram: if using Cloudinary, ensure JPEG output
    let finalMediaUrl = mediaUrl;
    if (finalMediaUrl.includes('cloudinary.com') && !finalMediaUrl.includes('/f_jpg')) {
      finalMediaUrl = finalMediaUrl.replace('/upload/', '/upload/f_jpg,q_auto/');
    }

    // Step 1: Create Container
    const containerRes = await axios.post(`${BASE_URL}/${igUserId}/media`, null, {
      params: {
        image_url: finalMediaUrl,
        caption: caption,
        access_token: pageAccessToken
      }
    });

    const creationId = containerRes.data.id;
    if (!creationId) {
      throw new Error('Failed to create Instagram media container');
    }

    console.log(`⏳ Instagram container created: ${creationId}. Waiting for processing...`);

    // Poll container status until FINISHED (Meta processes media asynchronously)
    let isReady = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isReady && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      attempts++;

      try {
        const statusRes = await axios.get(`${BASE_URL}/${creationId}`, {
          params: {
            fields: 'status_code',
            access_token: pageAccessToken
          }
        });

        const statusCode = statusRes.data?.status_code;
        console.log(`Instagram container ${creationId} status (attempt ${attempts}):`, statusCode);

        if (statusCode === 'FINISHED') {
          isReady = true;
          break;
        } else if (statusCode === 'ERROR') {
          throw new Error('Instagram rejected the media (invalid format, aspect ratio, or corrupt file)');
        }
      } catch (pollErr) {
        if (pollErr.message.includes('Instagram rejected')) throw pollErr;
        console.warn(`Container polling attempt ${attempts} warning:`, pollErr.message);
      }
    }

    // Step 2: Publish Container
    const publishRes = await axios.post(`${BASE_URL}/${igUserId}/media_publish`, null, {
      params: {
        creation_id: creationId,
        access_token: pageAccessToken
      }
    });

    return {
      success: true,
      metaPostId: publishRes.data.id
    };
  } catch (error) {
    console.error(`Instagram Business Post Error (${igUserId}):`, error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};

// ─── INSTAGRAM LOGIN API FUNCTIONS ────────────────────────────────────────────

/**
 * Exchange Instagram OAuth code for short-lived access token
 * Used with Instagram Login API (direct Instagram login, not Facebook)
 */
const exchangeInstagramCode = async ({ code, callbackUri, appId, appSecret }) => {
  try {
    const cleanCode = code ? String(code).split('#_')[0].split('#')[0] : code;
    const cleanUri = callbackUri ? String(callbackUri).split('#')[0] : callbackUri;
    const params = new URLSearchParams();
    params.append('client_id', appId);
    params.append('client_secret', appSecret);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', cleanUri);
    params.append('code', cleanCode);

    const response = await axios.post('https://api.instagram.com/oauth/access_token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('📸 Instagram OAuth token exchange success:', response.data);

    return {
      accessToken: response.data.access_token,
      userId: response.data.user_id || response.data.id,
      username: response.data.username || response.data.user?.username || null,
      data: response.data
    };
  } catch (error) {
    console.error('Instagram Code Exchange Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error_message || error.response?.data?.error?.message || 'Failed to exchange Instagram code');
  }
};

/**
 * Exchange short-lived Instagram token for long-lived token (60 days)
 */
const getInstagramLongLivedToken = async ({ shortToken, appSecret }) => {
  try {
    const response = await axios.get('https://graph.instagram.com/access_token', {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: appSecret,
        access_token: shortToken
      }
    });
    if (response.data && response.data.access_token) {
      return response.data.access_token;
    }
    return shortToken;
  } catch (error) {
    console.warn('Instagram Long-Lived Token warning (falling back to shortToken):', error.response?.data || error.message);
    return shortToken;
  }
};

/**
 * Get Instagram user profile info (id, username)
 */
const getInstagramUserInfo = async (accessToken, fallbackUserId, fallbackUsername) => {
  // 1. If username was provided directly in OAuth token exchange payload
  if (fallbackUsername) {
    return { id: String(fallbackUserId), username: fallbackUsername };
  }

  // 2. Try graph.instagram.com/{userId}
  if (fallbackUserId) {
    try {
      const response = await axios.get(`https://graph.instagram.com/${fallbackUserId}`, {
        params: {
          fields: 'id,username,name,profile_picture_url',
          access_token: accessToken
        }
      });
      if (response.data && response.data.username) {
        return response.data;
      }
    } catch (err) {
      console.warn('graph.instagram.com/{userId} note:', err.response?.data || err.message);
    }
  }

  // 3. Try graph.instagram.com/me
  try {
    const response = await axios.get('https://graph.instagram.com/me', {
      params: {
        fields: 'id,username',
        access_token: accessToken
      }
    });
    if (response.data && response.data.username) {
      return response.data;
    }
  } catch (error) {
    console.warn('graph.instagram.com/me query note:', error.response?.data || error.message);
  }

  // 4. Try graph.facebook.com/v19.0/{userId}
  try {
    const endpoint = fallbackUserId ? `https://graph.facebook.com/v19.0/${fallbackUserId}` : 'https://graph.facebook.com/v19.0/me';
    const fbResponse = await axios.get(endpoint, {
      params: {
        fields: 'id,username,name',
        access_token: accessToken
      }
    });
    if (fbResponse.data && (fbResponse.data.username || fbResponse.data.name)) {
      return { id: fbResponse.data.id, username: fbResponse.data.username || fbResponse.data.name };
    }
  } catch (fbErr) {
    console.warn('graph.facebook.com/v19.0 fallback note:', fbErr.response?.data || fbErr.message);
  }

  // 5. Fallback with userId
  if (fallbackUserId) {
    return { id: String(fallbackUserId), username: `instagram_${fallbackUserId}` };
  }

  throw new Error('Failed to fetch Instagram user info');
};

export {
  exchangeShortToLongToken,
  getUserPagesAndInstagram,
  publishToFacebookPage,
  publishToInstagramBusiness,
  exchangeInstagramCode,
  getInstagramLongLivedToken,
  getInstagramUserInfo
};
