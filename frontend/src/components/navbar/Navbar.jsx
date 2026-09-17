import React from 'react';
import { Share2 } from 'lucide-react';

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 px-5 py-2.5 flex items-center justify-between shadow-sm">
      {/* Brand Logo */}
      <div className="flex items-center space-x-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#ef6111] text-white shadow-md shadow-[#ef6111]/30 flex items-center justify-center">
          <Share2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className="font-extrabold text-base text-slate-900 tracking-tight">Meta AutoPost</h1>
            <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-[#ef6111]/10 text-[#ef6111] border border-[#ef6111]/30 rounded-full">
              PRO SaaS
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Multi-Account Facebook & Instagram Scheduler</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
          Automated Meta Cloud Platform
        </span>
      </div>
    </header>
  );
};
