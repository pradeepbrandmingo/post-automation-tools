import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from '../router';

export const TermsPage = () => {
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
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Terms of Service</h1>
            <p className="text-xs text-slate-500">Last updated: September 2026</p>
          </div>
        </div>

        <div className="prose prose-slate text-sm text-slate-700 space-y-4 leading-relaxed">
          <p>
            By using <strong>Meta AutoPost PRO SaaS</strong>, you agree to comply with and be bound by the following terms and conditions of use.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">1. Acceptance of Terms</h2>
          <p>
            By accessing or using our platform, you confirm that you have read, understood, and agreed to these Terms and Meta’s Platform Terms.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">2. Permitted Use</h2>
          <p>
            You agree to use this service exclusively for legitimate social media management, publishing, and scheduling of content to accounts you own or manage with proper permission.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">3. Content Responsibility</h2>
          <p>
            You are solely responsible for the content you schedule or publish. You agree not to post abusive, defamatory, copyright-infringing, or spam material violating Meta Policies.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">4. Contact Information</h2>
          <p>
            For any queries regarding these Terms, contact us at <strong>support@brandmingo.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
