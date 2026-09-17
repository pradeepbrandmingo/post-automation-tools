import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertTriangle, Send, Trash2, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

export const CalendarView = ({ posts, onRefresh }) => {
  const { showToast } = useToast();
  const [filter, setFilter] = useState('all');
  const [runningCron, setRunningCron] = useState(false);

  const filteredPosts = posts.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const handlePublishNow = async (id) => {
    try {
      await api.publishPostNow(id);
      showToast('Post trigger completed successfully!', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Error publishing post', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheduled post?')) return;
    try {
      await api.deletePost(id);
      showToast('Scheduled post deleted', 'info');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Error deleting post', 'error');
    }
  };

  const handleRunCron = async () => {
    setRunningCron(true);
    try {
      const res = await api.runSchedulerManual();
      showToast(`Cron Engine Completed! Processed ${res.result?.processed || 0} posts.`, 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Cron Execution Error', 'error');
    } finally {
      setRunningCron(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-[#ef6111]" />
            <span>Content Calendar & Scheduled Posts</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Manage and track your Meta post queues</p>
        </div>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-600">
            {['all', 'scheduled', 'published', 'failed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-2.5 py-1 rounded-md capitalize transition ${filter === st ? 'bg-[#ef6111] text-white shadow-sm' : 'hover:text-slate-900'}`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Manual Run Engine */}
          <button
            onClick={handleRunCron}
            disabled={runningCron}
            className="px-3 py-1.5 rounded-lg bg-[#ef6111]/10 hover:bg-[#ef6111]/20 text-[#ef6111] border border-[#ef6111]/30 text-xs font-bold transition flex items-center space-x-1"
            title="Run Firebase Cron Publisher manually"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${runningCron ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Run Engine</span>
          </button>
        </div>
      </div>

      {/* Posts Grid / Cards */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-slate-500 border border-slate-200 shadow-sm">
          <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-800 text-sm">No Posts Found</p>
          <p className="text-xs text-slate-400 mt-0.5">Create a post to start filling your content calendar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredPosts.map((post) => {
            const isScheduled = post.status === 'scheduled';
            const isPublished = post.status === 'published';
            const isFailed = post.status === 'failed';

            return (
              <div key={post._id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3 relative flex flex-col justify-between hover:border-[#ef6111]/60 transition">
                <div>
                  {/* Top Status & Date */}
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] flex items-center space-x-1 ${
                      isScheduled ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      isPublished ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {isScheduled && <Clock className="w-3 h-3 inline mr-1" />}
                      {isPublished && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                      {isFailed && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                      <span>{post.status}</span>
                    </span>

                    <span className="text-slate-500 font-semibold text-[11px]">
                      📅 {new Date(post.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  {/* Caption & Media */}
                  <div className="flex gap-3">
                    {post.mediaUrl && (
                      <img src={post.mediaUrl} alt="Post Media" className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0" />
                    )}
                    <p className="text-xs text-slate-800 line-clamp-3 leading-relaxed font-medium">
                      {post.caption}
                    </p>
                  </div>
                </div>

                {/* Bottom Target Accounts & Actions */}
                <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-slate-500 font-medium">
                    <span>Target:</span>
                    <span className="font-bold text-slate-900">
                      {post.targetAccounts?.length || 1} Account(s)
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {isScheduled && (
                      <button
                        onClick={() => handlePublishNow(post._id)}
                        className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[11px] transition flex items-center space-x-1"
                        title="Publish Immediately"
                      >
                        <Send className="w-3 h-3" />
                        <span>Publish Now</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(post._id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
