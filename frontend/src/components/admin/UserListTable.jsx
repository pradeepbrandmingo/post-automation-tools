import React from 'react';
import { Edit3, UserX, UserCheck, Trash2 } from 'lucide-react';

export const UserListTable = ({ users, onSelectUser, onToggleStatus, onDeleteUser }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          All Managed SaaS Users (Click row to view full details page)
        </span>
        <span className="text-xs text-slate-500 font-semibold">{users.length} Users</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100/70 text-slate-600 uppercase tracking-wider border-b border-slate-200 font-bold text-[11px]">
            <tr>
              <th className="px-4 py-2.5">User Details</th>
              <th className="px-4 py-2.5">Role</th>
              <th className="px-4 py-2.5">Meta Accounts</th>
              <th className="px-4 py-2.5">Posts</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr
                key={u._id}
                onClick={() => onSelectUser(u)}
                className="hover:bg-[#ef6111]/10 cursor-pointer transition group"
                title="Click to open full page view for this user"
              >
                <td className="px-4 py-3 font-medium">
                  <p className="font-bold text-slate-900 text-xs flex items-center space-x-1.5 group-hover:text-[#ef6111] transition">
                    <span>{u.name}</span>
                    <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#ef6111] transition inline" />
                  </p>
                  <p className="text-slate-500 text-[11px]">{u.email}</p>
                </td>

                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                    u.role === 'super_admin' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-[#ef6111]/10 text-[#ef6111] border border-[#ef6111]/30'
                  }`}>
                    {u.role}
                  </span>
                </td>

                <td className="px-4 py-3 font-bold text-slate-800">
                  {u.accountsCount || 0} Connected
                </td>

                <td className="px-4 py-3 font-bold text-slate-800">
                  {u.postsCount || 0} Posts
                </td>

                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                    u.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}>
                    {u.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-right space-x-1.5">
                  <button
                    onClick={(e) => onToggleStatus(u._id, u.status, e)}
                    className={`p-1 rounded-md border transition ${
                      u.status === 'active' ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100' : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                    }`}
                    title={u.status === 'active' ? 'Suspend User' : 'Activate User'}
                  >
                    {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                  </button>

                  {u.role !== 'super_admin' && (
                    <button
                      onClick={(e) => onDeleteUser(u._id, u.email, e)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 bg-slate-50 border border-slate-200 hover:bg-rose-50 transition"
                      title="Delete User"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
