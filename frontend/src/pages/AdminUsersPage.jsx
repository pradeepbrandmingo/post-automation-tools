import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/common/Toast';
import { UserListTable } from '../components/admin/UserListTable';
import { UserCreateModal } from '../components/admin/UserCreateModal';
import { UserDetailView } from '../components/admin/UserDetailView';

export const AdminUsersPage = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Inspect & Edit User State (Full Page View)
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const uRes = await api.getAdminUsers();
      const sRes = await api.getAdminStats();
      if (uRes.success) setUsers(uRes.users);
      if (sRes.success) setStats(sRes.stats);
    } catch (err) {
      showToast(err.message || 'Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus, e) => {
    if (e) e.stopPropagation();
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.updateUserStatus(userId, nextStatus);
      showToast(`User status updated to ${nextStatus}`, 'info');
      fetchAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteUser = async (userId, userEmail, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete user ${userEmail}? All their connected accounts and posts will be deleted permanently.`)) return;
    try {
      await api.deleteUser(userId);
      showToast(`User ${userEmail} deleted successfully!`, 'success');
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(null);
      }
      fetchAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-semibold space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#ef6111]" />
        <p>Loading Super Admin Portal...</p>
      </div>
    );
  }

  // View Mode 2: Full Page Dedicated User Detail View
  if (selectedUser) {
    return (
      <UserDetailView
        user={selectedUser}
        onBack={() => setSelectedUser(null)}
        onStatusUpdated={fetchAdminData}
        onDeleteUser={handleDeleteUser}
      />
    );
  }

  // View Mode 1: All Users Table View
  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#ef6111]" />
            <span>Super Admin User Control Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Click any user row to open full details page (Edit details, passwords, accounts & posts)</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#ef6111] hover:bg-[#d9540c] text-white font-extrabold text-xs shadow-md shadow-[#ef6111]/25 transition flex items-center space-x-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Create New User</span>
        </button>
      </div>

      {/* Global Stats Counter Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Client Users</span>
            <p className="text-xl font-black text-[#ef6111] mt-0.5">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Meta Connections</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{stats.totalAccounts}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Scheduled Posts</span>
            <p className="text-xl font-black text-amber-600 mt-0.5">{stats.scheduledPosts}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Published Live</span>
            <p className="text-xl font-black text-emerald-600 mt-0.5">{stats.publishedPosts}</p>
          </div>
        </div>
      )}

      {/* Modular User Create Modal */}
      <UserCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchAdminData}
      />

      {/* Modular All Users Table */}
      <UserListTable
        users={users}
        onSelectUser={(u) => setSelectedUser(u)}
        onToggleStatus={handleToggleStatus}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
};
