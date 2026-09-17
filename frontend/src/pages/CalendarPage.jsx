import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CalendarView } from '../components/calendar/CalendarView';
import { RefreshCw } from 'lucide-react';

export const CalendarPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.getPosts('all');
      if (res.success) setPosts(res.posts);
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
        <p>Loading Calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CalendarView posts={posts} onRefresh={fetchPosts} />
    </div>
  );
};
