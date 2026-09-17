import React from 'react';
import { useNavigate, useLocation } from '../../router';
import { LayoutDashboard, PlusCircle, Calendar as CalendarIcon, Users2, ShieldAlert, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isSuperAdmin } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/create', label: 'Create & Schedule', icon: PlusCircle },
    { path: '/calendar', label: 'Content Calendar', icon: CalendarIcon },
    { path: '/accounts', label: 'Connected Accounts', icon: Users2 }
  ];

  if (isSuperAdmin) {
    navItems.push({ path: '/admin/users', label: 'Super Admin Control', icon: ShieldAlert, highlight: true });
  }

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between py-5 px-3 hidden md:flex min-h-[calc(100vh-53px)] shadow-sm">
      <div className="space-y-4">
        <div className="px-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Navigation</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-[#ef6111] text-white shadow-md shadow-[#ef6111]/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Vibrant Orange Solid User Profile & Logout Button Card */}
      <div className="pt-3 border-t border-slate-100">
        {user && (
          <button
            onClick={logout}
            className="w-full p-3 rounded-2xl bg-[#ef6111] hover:bg-[#d9540c] text-white shadow-md shadow-[#ef6111]/25 transition-all duration-200 flex items-center justify-between group cursor-pointer text-left"
            title="Click to Sign Out"
          >
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-8 h-8 rounded-xl bg-white text-[#ef6111] flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-black text-white leading-tight truncate">{user.name}</p>
                <div className="flex items-center space-x-1 mt-0.5">
                  {isSuperAdmin ? (
                    <span className="text-[9px] text-white/90 font-extrabold flex items-center space-x-0.5">
                      <ShieldCheck className="w-3 h-3 inline text-white" /> Super Admin
                    </span>
                  ) : (
                    <span className="text-[9px] text-white/90 font-extrabold flex items-center space-x-0.5">
                      <UserCheck className="w-3 h-3 inline text-white" /> Client User
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-1.5 rounded-lg text-white/80 group-hover:text-white group-hover:bg-white/20 transition shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
          </button>
        )}
      </div>
    </aside>
  );
};
