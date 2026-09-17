import React, { useState, useEffect } from 'react';
import { useNavigate } from '../router';
import { Users2, Calendar, CheckCircle2, Clock, PlusCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { MetaOnboarding } from '../components/onboarding/MetaOnboarding';
import { PostComposer } from '../components/composer/PostComposer';
import { CalendarView } from '../components/calendar/CalendarView';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const accRes = await api.getAccounts();
      const postRes = await api.getPosts('all');

      if (accRes.success) setAccounts(accRes.accounts);
      if (postRes.success) setPosts(postRes.posts);
    } catch (err) {
      console.error('Error fetching dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const publishedCount = posts.filter(p => p.status === 'published').length;

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-semibold space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#ef6111]" />
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900">Overview & Analytics</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Track connected social accounts and scheduled posting engine</p>
        </div>

        <button
          onClick={() => navigate('/create')}
          className="px-4 py-2.5 rounded-xl bg-[#ef6111] hover:bg-[#d9540c] text-white font-bold text-xs shadow-md shadow-[#ef6111]/25 transition flex items-center space-x-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Post</span>
        </button>
      </div>

      {/* Metrics Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Connected Accounts</span>
            <Users2 className="w-4 h-4 text-[#ef6111]" />
          </div>
          <p className="text-xl font-black text-slate-900">{accounts.length}</p>
          <p className="text-[10px] text-slate-500 font-medium">Facebook Pages & Instagram IDs</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Scheduled Queue</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-amber-600">{scheduledCount}</p>
          <p className="text-[10px] text-slate-500 font-medium">Pending auto-publish posts</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Published Live</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-emerald-600">{publishedCount}</p>
          <p className="text-[10px] text-slate-500 font-medium">Successfully published</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Content</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-black text-purple-700">{posts.length}</p>
          <p className="text-[10px] text-slate-500 font-medium">Total posts in system</p>
        </div>
      </div>

      {/* Onboarding Banner or Post Composer */}
      {accounts.length === 0 ? (
        <MetaOnboarding onAccountConnected={fetchDashboardData} />
      ) : (
        <div className="space-y-6">
          <PostComposer accounts={accounts} onPostCreated={fetchDashboardData} />
          <CalendarView posts={posts} onRefresh={fetchDashboardData} />
        </div>
      )}
    </div>
  );
};
