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

export {
  exchangeShortToLongToken,
  getUserPagesAndInstagram,
  publishToFacebookPage,
  publishToInstagramBusiness
};
