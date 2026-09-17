import React from 'react';
import { Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from '../router';

export const DataDeletionPage = () => {
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
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Data Deletion Instructions</h1>
            <p className="text-xs text-slate-500">Meta Platform Compliance</p>
          </div>
        </div>

        <div className="prose prose-slate text-sm text-slate-700 space-y-4 leading-relaxed">
          <p>
            According to Meta Platform rules, <strong>Meta AutoPost PRO SaaS</strong> provides a mechanism for users to request the deletion of their personal and account data.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">How to Delete Your Data</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Go to your Facebook Profile's <strong>Settings & Privacy ➔ Settings</strong>.
            </li>
            <li>
              Navigate to <strong>Apps and Websites</strong> to find <strong>Social Media Manager</strong>.
            </li>
            <li>
              Click <strong>Remove</strong> to disconnect the app and revoke all permissions.
            </li>
            <li>
              To request complete deletion of your scheduled posts and database records stored on our servers, send an email to <strong>support@brandmingo.com</strong> with your registered email ID or Facebook/Instagram username.
            </li>
          </ol>

          <p className="mt-4">
            Your data and associated OAuth access tokens will be completely purged from our database within 48 hours of receiving your request.
          </p>
        </div>
      </div>
    </div>
  );
};
