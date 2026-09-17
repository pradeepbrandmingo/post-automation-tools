import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

export const UserCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createUser({
        name: createName,
        email: createEmail,
        password: createPassword,
        role: 'user'
      });
      if (res.success) {
        showToast(`User "${createName}" created successfully!`, 'success');
        setCreateName('');
        setCreateEmail('');
        setCreatePassword('');
        onSuccess();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-[#ef6111]" />
            <span>Create New User Account</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#ef6111] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder="client@agency.com"
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#ef6111] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assign Password</label>
            <div className="relative">
              <input
                type={showCreatePassword ? 'text' : 'password'}
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="Set password for user"
                required
                className="w-full pl-3 pr-9 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#ef6111] focus:bg-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowCreatePassword(!showCreatePassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
              >
                {showCreatePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">User Role</label>
            <div className="px-3 py-2 rounded-lg bg-[#ef6111]/10 border border-[#ef6111]/30 text-[#ef6111] text-xs font-bold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#ef6111]"></span>
              <span>Standard User (Client / SMM)</span>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-[#ef6111] hover:bg-[#d9540c] text-white font-bold text-xs shadow-md shadow-[#ef6111]/25 transition"
            >
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
