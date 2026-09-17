import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Mail, Lock, Eye, EyeOff, Users2, Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

export const UserDetailView = ({ user, onBack, onStatusUpdated, onDeleteUser }) => {
  const { showToast } = useToast();
  const [inspectLoading, setInspectLoading] = useState(true);
  const [inspectData, setInspectData] = useState({ accounts: [], posts: [] });

  // Edit Form State
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editStatus, setEditStatus] = useState(user.status);
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [user._id]);

  const fetchUserData = async () => {
    setInspectLoading(true);
    try {
      const res = await api.getUserData(user._id);
      if (res.success) {
        setInspectData({
          accounts: res.accounts || [],
          posts: res.posts || []
        });
      }
    } catch (err) {
      showToast(err.message || 'Failed to load user data', 'error');
    } finally {
      setInspectLoading(false);
    }
  };

  const handleUpdateUserDetails = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);

    try {
      const res = await api.updateUserDetails(user._id, {
        name: editName,
        email: editEmail,
        role: user.role,
        status: editStatus,
        password: editPassword
      });

      if (res.success) {
        showToast(`Details for "${editName}" updated successfully!`, 'success');
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update user details', 'error');
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Navigation & Top Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition flex items-center space-x-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4 text-[#ef6111]" />
            <span>Back to Users List</span>
          </button>

          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-extrabold text-slate-900">{editName}</h1>
              <span className={`px-2 py-0.5 rounded-md font-extrabold uppercase text-[10px] ${
                editStatus === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                {editStatus}
              </span>
              <span className="px-2 py-0.5 rounded-md font-extrabold uppercase text-[10px] bg-[#ef6111]/10 text-[#ef6111] border border-[#ef6111]/30">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{editEmail}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 w-full md:w-auto">
          {user.role !== 'super_admin' && (
            <button
              onClick={() => onDeleteUser(user._id, user.email)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
            >
              Delete User
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Edit User Profile Form */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <div className="border-b border-slate-100 pb-2.5 flex items-center space-x-2">
            <Edit3 className="w-4 h-4 text-[#ef6111]" />
            <h2 className="text-sm font-bold text-slate-900">Edit Profile & Credentials</h2>
          </div>

          <form onSubmit={handleUpdateUserDetails} className="space-y-3 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#ef6111] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#ef6111] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">User Role</label>
              <div className="px-3 py-2 rounded-lg bg-[#ef6111]/10 border border-[#ef6111]/30 text-[#ef6111] text-xs font-bold flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#ef6111]"></span>
                <span>{user.role === 'super_admin' ? 'Super Admin' : 'Standard User (Client / SMM)'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-[#ef6111]"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assign New Password (Optional)</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showEditPassword ? 'text' : 'password'}
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave blank to keep existing"
                  className="w-full pl-9 pr-9 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#ef6111] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                >
                  {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={editSubmitting}
              className="w-full py-2.5 rounded-xl bg-[#ef6111] hover:bg-[#d9540c] text-white font-bold text-xs shadow-md shadow-[#ef6111]/25 transition flex items-center justify-center space-x-1.5 mt-2"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{editSubmitting ? 'Saving Changes...' : 'Save User Changes'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: User Data Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Panel 1: Connected Social Media Accounts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <Users2 className="w-4 h-4 text-[#ef6111]" />
                <h2 className="text-sm font-bold text-slate-900">Connected Meta Accounts</h2>
              </div>
              <span className="text-xs text-[#ef6111] font-bold px-2.5 py-0.5 rounded-full bg-[#ef6111]/10 border border-[#ef6111]/30">
                {inspectData.accounts.length} Account(s)
              </span>
            </div>

            {inspectLoading ? (
              <div className="py-6 text-center text-slate-400 text-xs">Loading accounts...</div>
            ) : inspectData.accounts.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs font-medium">This user has not connected any Facebook Pages or Instagram accounts yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inspectData.accounts.map((acc) => (
                  <div key={acc._id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
                    <img src={acc.avatarUrl} alt={acc.accountName} className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0" />
                    <div className="truncate text-left">
                      <p className="text-xs font-bold text-slate-900 truncate">{acc.accountName}</p>
                      <p className="text-[11px] text-slate-500 capitalize">{acc.platform} {acc.instagramUsername ? `• @${acc.instagramUsername}` : ''}</p>
                      <span className="text-[9px] font-mono text-emerald-600 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 inline" /> 60-Day Token Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel 2: User Posts Queue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900">Scheduled & Published Content Queue</h2>
              </div>
              <span className="text-xs text-purple-700 font-bold px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200">
                {inspectData.posts.length} Post(s)
              </span>
            </div>

            {inspectLoading ? (
              <div className="py-6 text-center text-slate-400 text-xs">Loading posts...</div>
            ) : inspectData.posts.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs font-medium">No scheduled or published posts found for this user.</div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {inspectData.posts.map((post) => (
                  <div key={post._id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 truncate">
                      {post.mediaUrl ? (
                        <img src={post.mediaUrl} alt="Media" className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-bold shrink-0">TEXT</div>
                      )}
                      <div className="truncate text-left space-y-0.5">
                        <p className="text-slate-900 text-xs font-medium line-clamp-2 leading-relaxed">{post.caption}</p>
                        <p className="text-[10px] text-slate-500 flex items-center space-x-1">
                          <span>📅 {new Date(post.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          <span>• Target: {post.targetAccounts?.length || 1} Account(s)</span>
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] shrink-0 flex items-center space-x-1 ${
                      post.status === 'published' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      post.status === 'scheduled' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {post.status === 'scheduled' && <Clock className="w-3 h-3 inline mr-1" />}
                      {post.status === 'published' && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                      {post.status === 'failed' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                      <span>{post.status}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
