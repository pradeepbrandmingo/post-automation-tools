import React, { useState, useEffect } from 'react';
import { Users2, Plus, Trash2, RefreshCw, CheckCircle2, Facebook, Instagram } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/common/Toast';
import { MetaOnboarding } from '../components/onboarding/MetaOnboarding';

export const AccountsPage = () => {
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.getAccounts();
      if (res.success) setAccounts(res.accounts);
    } catch (err) {
      showToast(err.message || 'Failed to load accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Disconnect this social media account?')) return;
    try {
      await api.deleteAccount(id);
      showToast('Social account disconnected successfully', 'success');
      fetchAccounts();
    } catch (err) {
      showToast(err.message || 'Failed to disconnect account', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-semibold space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#ef6111]" />
        <p>Loading Accounts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Users2 className="w-5 h-5 text-[#ef6111]" />
            <span>Connected Meta Accounts (Agency Hub)</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage multiple client Facebook Pages and Instagram accounts</p>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="px-4 py-2.5 rounded-xl bg-[#ef6111] hover:bg-[#d9540c] text-white font-bold text-xs shadow-md shadow-[#ef6111]/25 transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {showAddModal && (
        <div className="mb-5">
          <MetaOnboarding onAccountConnected={() => { setShowAddModal(false); fetchAccounts(); }} />
        </div>
      )}

      {/* Grid of Connected Accounts or Default Onboarding Banner */}
      {!showAddModal && accounts.length === 0 ? (
        <MetaOnboarding onAccountConnected={fetchAccounts} />
      ) : accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {accounts.map(acc => {
            const isInstagram = acc.platform === 'instagram';
            const isFacebook = acc.platform === 'facebook';

            return (
              <div key={acc._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 relative flex flex-col justify-between hover:border-[#ef6111]/60 transition">
                <div>
                  <div className="flex items-center space-x-3 mb-2.5">
                    <img src={acc.avatarUrl} alt={acc.accountName} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0" />
                    <div className="truncate text-left">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug truncate">{acc.accountName}</h3>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider flex items-center space-x-1 ${
                          isInstagram
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}>
                          {isInstagram ? <Instagram className="w-3 h-3 inline mr-0.5" /> : <Facebook className="w-3 h-3 inline mr-0.5" />}
                          <span>{isInstagram ? 'Instagram Business' : 'Facebook Page'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px]">
                    {acc.facebookPageId && (
                      <p><span className="text-slate-400">FB Page ID:</span> {acc.facebookPageId}</p>
                    )}
                    {acc.instagramAccountId && (
                      <p><span className="text-slate-400">IG Biz ID:</span> {acc.instagramAccountId}</p>
                    )}
                    <p className="flex items-center space-x-1 text-emerald-600 font-bold pt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>60-Day Meta Access Token Active</span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Status: Active</span>
                  <button
                    onClick={() => handleDelete(acc._id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                    title="Disconnect Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
