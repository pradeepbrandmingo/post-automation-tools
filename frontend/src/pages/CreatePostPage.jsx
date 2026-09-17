import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PostComposer } from '../components/composer/PostComposer';
import { MetaOnboarding } from '../components/onboarding/MetaOnboarding';
import { RefreshCw } from 'lucide-react';

export const CreatePostPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.getAccounts();
      if (res.success) setAccounts(res.accounts);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-semibold space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
        <p>Loading Accounts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {accounts.length === 0 ? (
        <MetaOnboarding onAccountConnected={fetchAccounts} />
      ) : (
        <PostComposer accounts={accounts} onPostCreated={fetchAccounts} />
      )}
    </div>
  );
};
