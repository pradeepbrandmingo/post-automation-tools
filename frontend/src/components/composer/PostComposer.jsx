import React, { useState } from 'react';
import { Image, Video, Calendar, Clock, Send, Sparkles, CheckSquare, Square, Hash } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

export const PostComposer = ({ accounts, onPostCreated }) => {
  const { showToast } = useToast();
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('none');
  const [selectedAccountIds, setSelectedAccountIds] = useState(accounts.map(a => a._id));
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 10);
    return d.toISOString().slice(0, 16);
  });
  const [loading, setLoading] = useState(false);

  const toggleAccount = (id) => {
    if (selectedAccountIds.includes(id)) {
      setSelectedAccountIds(selectedAccountIds.filter(aId => aId !== id));
    } else {
      setSelectedAccountIds([...selectedAccountIds, id]);
    }
  };

  const selectAllAccounts = () => {
    if (selectedAccountIds.length === accounts.length) {
      setSelectedAccountIds([]);
    } else {
      setSelectedAccountIds(accounts.map(a => a._id));
    }
  };

  const sampleImages = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
  ];

  const handleAddSampleHashtags = () => {
    setCaption(prev => prev + '\n\n#MetaAutoPost #SocialMediaManager #FacebookPage #InstagramBusiness #DigitalMarketing');
  };

  const handleSubmit = async (postNow = false) => {
    if (!caption.trim()) {
      showToast('Please enter a caption for your post', 'error');
      return;
    }
    if (selectedAccountIds.length === 0) {
      showToast('Select at least one connected Facebook Page or Instagram Account', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await api.createPost({
        caption,
        mediaUrl,
        mediaType: mediaUrl ? (mediaType === 'none' ? 'image' : mediaType) : 'none',
        targetAccounts: selectedAccountIds,
        scheduledAt: scheduledDate,
        postNow
      });

      if (res.success) {
        showToast(postNow ? '🚀 Published Immediately!' : '📅 Post Scheduled Successfully!', 'success');
        setCaption('');
        setMediaUrl('');
        if (onPostCreated) onPostCreated();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span>Create & Schedule Content</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Post across Facebook Pages & Instagram Business Accounts</p>
        </div>
        <button
          type="button"
          onClick={handleAddSampleHashtags}
          className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#ef6111]/10 text-[#ef6111] border border-[#ef6111]/30 hover:bg-[#ef6111]/20 transition flex items-center space-x-1"
        >
          <Hash className="w-3.5 h-3.5" />
          <span>Add Hashtags</span>
        </button>
      </div>

      {/* Target Accounts Multi-Select Checklist */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Target Accounts</label>
          <button
            type="button"
            onClick={selectAllAccounts}
            className="text-xs text-[#ef6111] hover:underline font-bold"
          >
            {selectedAccountIds.length === accounts.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {accounts.map(acc => {
            const isSelected = selectedAccountIds.includes(acc._id);
            return (
              <div
                key={acc._id}
                onClick={() => toggleAccount(acc._id)}
                className={`p-2.5 rounded-xl cursor-pointer border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#ef6111]/10 border-[#ef6111] text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <img src={acc.avatarUrl} alt={acc.accountName} className="w-7 h-7 rounded-full object-cover border border-slate-300 shrink-0" />
                  <div className="truncate text-left">
                    <p className="text-xs font-bold text-slate-900 truncate">{acc.accountName}</p>
                    <p className="text-[10px] text-slate-500 capitalize font-medium">{acc.platform} • {acc.instagramUsername ? `@${acc.instagramUsername}` : 'FB Page'}</p>
                  </div>
                </div>
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-[#ef6111] shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Caption TextArea */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Post Caption & Content</label>
        <textarea
          rows={4}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write your post caption, call to action, emojis, and hashtags here..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:border-[#ef6111] focus:bg-white transition resize-y placeholder:text-slate-400"
        />
      </div>

      {/* Cloudinary / Media URL */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Cloudinary Media URL (Image or Video)</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/your_cloud/image/upload/sample.jpg"
            className="flex-1 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:border-[#ef6111] focus:bg-white"
          />
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold focus:outline-none"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        {/* Quick Sample Image Selector */}
        <div className="flex items-center space-x-2 pt-0.5">
          <span className="text-[10px] text-slate-500 font-bold">Quick Demo Images:</span>
          {sampleImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => { setMediaUrl(img); setMediaType('image'); }}
              className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 hover:border-[#ef6111] transition"
            >
              <img src={img} alt="Sample" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Media Live Preview */}
        {mediaUrl && (
          <div className="mt-2 p-2 rounded-xl bg-slate-50 border border-slate-200 max-w-xs">
            <span className="text-[9px] font-bold uppercase text-slate-500 block mb-1">Live Media Preview</span>
            {mediaType === 'video' ? (
              <video src={mediaUrl} controls className="w-full h-32 object-cover rounded-lg" />
            ) : (
              <img src={mediaUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
            )}
          </div>
        )}
      </div>

      {/* Date & Time Picker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-[#ef6111]" />
            <span>Schedule Date & Time</span>
          </label>
          <input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:border-[#ef6111]"
          />
        </div>

        <div className="flex items-end gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(true)}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition flex items-center justify-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5 text-emerald-600" />
            <span>Post Now</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(false)}
            className="flex-1 py-2.5 rounded-xl bg-[#ef6111] hover:bg-[#d9540c] text-white font-bold text-xs shadow-md shadow-[#ef6111]/25 transition flex items-center justify-center space-x-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{loading ? 'Scheduling...' : 'Schedule Post'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
