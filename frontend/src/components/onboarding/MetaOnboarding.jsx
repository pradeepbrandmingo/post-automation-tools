import React, { useState } from 'react';
import { Share2, Facebook, Instagram, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const getInitiateUrl = (platform) => {
  // Use api.token (in-memory) with localStorage as fallback
  const authToken = api.token || localStorage.getItem('meta_autopost_token') || '';
  return `${API_BASE}/api/accounts/meta-initiate?platform=${platform}&authToken=${encodeURIComponent(authToken)}`;
};

export const MetaOnboarding = ({ onAccountConnected }) => {
  const { showToast } = useToast();
  const [loadingPlatform, setLoadingPlatform] = useState(null);

  const handleConnect = (platform) => {
    // Guard: Check if JWT token exists before opening popup
    const authToken = api.token || localStorage.getItem('meta_autopost_token') || '';
    if (!authToken) {
      showToast('Session expired! Please logout and login again.', 'error');
      return;
    }

    setLoadingPlatform(platform);
    showToast(`Opening ${platform === 'instagram' ? 'Instagram' : 'Facebook'} Login...`, 'info');

    const popup = window.open(getInitiateUrl(platform), `${platform}_oauth`, 'width=620,height=680');

    const checkPopup = setInterval(() => {
      try {
        // Detect when popup redirects back to our frontend domain
        if (popup && popup.location && popup.location.href && popup.location.href.includes(window.location.hostname)) {
          const url = new URL(popup.location.href);
          popup.close();
          clearInterval(checkPopup);
          setLoadingPlatform(null);

          if (url.searchParams.get('oauth_success')) {
            showToast('🎉 Meta account connected successfully!', 'success');
          } else if (url.searchParams.get('oauth_error')) {
            const errMsg = url.searchParams.get('oauth_error');
            if (errMsg === 'no_pages') {
              showToast('No Facebook Pages found. Please create a Facebook Page first.', 'error');
            } else {
              showToast(`Connection failed: ${errMsg}`, 'error');
            }
          }

          if (onAccountConnected) onAccountConnected();
        }
      } catch (e) {
        // Cross-origin error — popup is on Facebook domain, still waiting
      }

      if (popup && popup.closed) {
        clearInterval(checkPopup);
        setLoadingPlatform(null);
        if (onAccountConnected) onAccountConnected();
      }
    }, 800);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-7 text-center space-y-6 shadow-sm relative overflow-hidden">
      <div className="w-14 h-14 rounded-2xl bg-[#ef6111] text-white shadow-lg shadow-[#ef6111]/25 mx-auto flex items-center justify-center">
        <Share2 className="w-7 h-7 text-white" />
      </div>

      <div className="max-w-lg mx-auto space-y-2">
        <h2 className="text-xl font-extrabold text-slate-900">Connect Facebook & Instagram Accounts</h2>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Click below to open the official Facebook Login popup and grant access to your managed Pages & Instagram Business Accounts.
        </p>
      </div>

      {/* 2 Dedicated Platform Buttons + Quick Demo Option */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto pt-1">
        {/* Facebook Page Button */}
        <button
          type="button"
          disabled={loadingPlatform !== null}
          onClick={() => handleConnect('facebook')}
          className="flex-1 py-3.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-2"
        >
          {loadingPlatform === 'facebook' ? (
            <RefreshCw className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Facebook className="w-4 h-4 text-white" />
          )}
          <span>{loadingPlatform === 'facebook' ? 'Connecting...' : 'Connect Facebook Page'}</span>
        </button>

        {/* Instagram Business Button */}
        <button
          type="button"
          disabled={loadingPlatform !== null}
          onClick={() => handleConnect('instagram')}
          className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 hover:opacity-95 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-2"
        >
          {loadingPlatform === 'instagram' ? (
            <RefreshCw className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Instagram className="w-4 h-4 text-white" />
          )}
          <span>{loadingPlatform === 'instagram' ? 'Connecting...' : 'Connect Instagram Account'}</span>
        </button>
      </div>

      {/* Quick Demo Connect for Instant Testing / Client Demo */}
      <div className="max-w-xl mx-auto pt-1">
        <button
          type="button"
          disabled={loadingPlatform !== null}
          onClick={async () => {
            setLoadingPlatform('demo');
            try {
              const { api } = await import('../../services/api');
              const res = await api.connectMockAccount({
                pageName: 'Brand Official Page',
                instagramUsername: 'brand_official_ig',
                platform: 'both'
              });
              if (res.success) {
                showToast('🎉 Demo Facebook Page & Instagram Account connected successfully!', 'success');
                if (onAccountConnected) onAccountConnected();
              }
            } catch (err) {
              showToast(err.message || 'Demo connection failed', 'error');
            } finally {
              setLoadingPlatform(null);
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition flex items-center justify-center space-x-2"
        >
          {loadingPlatform === 'demo' ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <span>⚡ Instant Demo Connect (Test Facebook & Instagram Account)</span>
          )}
        </button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-3 border-t border-slate-100 text-left">
        <div className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <Facebook className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-extrabold text-slate-900">Facebook Pages</p>
            <p className="text-[10px] text-slate-500 font-medium">Auto-publish posts</p>
          </div>
        </div>

        <div className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <Instagram className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-extrabold text-slate-900">Instagram Business</p>
            <p className="text-[10px] text-slate-500 font-medium">Photos & Reels</p>
          </div>
        </div>

        <div className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-[#ef6111] shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-extrabold text-slate-900">60-Day Token</p>
            <p className="text-[10px] text-slate-500 font-medium">Long-lived & secure</p>
          </div>
        </div>
      </div>
    </div>
  );
};
