import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from '../router';

export const PrivacyPage = () => {
  const navigate = useNavigate();
  

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#ef6111]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
            <p className="text-xs text-slate-500">Last updated: September 2026</p>
          </div>
        </div>

        <div className="prose prose-slate text-sm text-slate-700 space-y-4 leading-relaxed">
          <p>
            Welcome to <strong>Meta AutoPost PRO SaaS</strong> ("we", "our", or "us"). We are committed to protecting your privacy and ensuring you have a secure experience when managing and scheduling posts for your Facebook Pages and Instagram Business accounts.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">1. Information We Collect</h2>
          <p>
            When you connect your Facebook or Instagram account, we collect only the necessary OAuth access tokens, page names, and Instagram business account IDs required to publish and schedule posts on your behalf. We do not collect or store your personal passwords.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To authenticate your identity via Meta Graph API & Instagram Login API.</li>
            <li>To publish and schedule content (images, videos, captions) directly to your authorized Facebook Pages and Instagram accounts.</li>
            <li>To display post analytics, execution logs, and scheduling status.</li>
          </ul>

          <h2 className="text-base font-bold text-slate-900 mt-6">3. Data Sharing & Security</h2>
          <p>
            We do not sell, rent, or trade your data to third parties. All access tokens are encrypted and securely stored. We use industry-standard HTTPS/TLS protocols for all data transmission.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">4. Data Deletion & Revocation</h2>
          <p>
            You can revoke access to Meta AutoPost at any time from your Facebook or Instagram App Settings, or request account data deletion via our Deauthorize URL: <code>/api/accounts/deauthorize</code>.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">5. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact our support team at <strong>support@brandmingo.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
