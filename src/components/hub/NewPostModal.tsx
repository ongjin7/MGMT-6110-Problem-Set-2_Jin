import React, { useState } from 'react';
import { ForumPost, ResidentUser } from '../../types';
import { X, MessageSquarePlus, ShieldCheck, Tag } from 'lucide-react';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Omit<ForumPost, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>) => void;
  currentUser: ResidentUser;
}

export const NewPostModal: React.FC<NewPostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
}) => {
  const [category, setCategory] = useState<ForumPost['category']>('expertise');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [priceOrBudget, setPriceOrBudget] = useState('');
  const [tagInput, setTagInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const categoryLabels: Record<ForumPost['category'], string> = {
      lost_found: 'Lost & Found',
      recommendations: 'Neighbour Recommendation',
      events: 'Community Event',
      marketplace: 'Buy / Sell / Giveaway',
      expertise: 'Resident Expertise',
    };

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onSubmit({
      category,
      categoryLabel: categoryLabels[category],
      title: title.trim(),
      content: content.trim(),
      authorName: `${currentUser.name} (${currentUser.initials})`,
      authorInitials: currentUser.initials,
      authorUnit: `${currentUser.block} ${currentUser.unit}`,
      isCurrentUser: true,
      contactMethod: contactMethod.trim() || `Telegram @${currentUser.initials.toLowerCase()} or chat in OLA Hub`,
      tags: tags.length > 0 ? tags : [categoryLabels[category]],
      price: priceOrBudget.trim() || undefined,
    });

    setTitle('');
    setContent('');
    setContactMethod('');
    setPriceOrBudget('');
    setTagInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="new-forum-post-modal"
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">New Community Post</h3>
              <p className="text-xs text-slate-500">Post to OLA residents community feed</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Verified Resident Indicator */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/80 border border-teal-200/70 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-700 text-white font-black text-xs flex items-center justify-center">
                {currentUser.initials}
              </div>
              <div>
                <span className="font-bold text-slate-900">
                  Posting as {currentUser.name} ({currentUser.initials})
                </span>
                <span className="text-slate-500 block text-[11px]">
                  {currentUser.block} • Unit {currentUser.unit}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              Verified Resident
            </span>
          </div>

          {/* Category Select */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Select Post Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
              {[
                { id: 'expertise', label: '🎾 Expertise / Coaching' },
                { id: 'lost_found', label: '🔍 Lost & Found' },
                { id: 'recommendations', label: '⭐ Recommendations' },
                { id: 'marketplace', label: '🛍️ Buy / Sell / Free' },
                { id: 'events', label: '🎉 Community Events' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as ForumPost['category'])}
                  className={`p-2 rounded-xl text-left border font-medium transition-all ${
                    category === cat.id
                      ? 'bg-teal-50 border-teal-500 text-teal-900 font-semibold ring-1 ring-teal-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Post Title */}
          <div>
            <label htmlFor="post-title" className="text-xs font-bold text-slate-700 block mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="post-title"
              type="text"
              required
              placeholder="e.g. Certified Tennis Coach available at OLA tennis court"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
          </div>

          {/* Post Content */}
          <div>
            <label htmlFor="post-content" className="text-xs font-bold text-slate-700 block mb-1">
              Details & Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="post-content"
              required
              rows={4}
              placeholder="Share the details with your neighbours (time, condition, service info, location in OLA)..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
          </div>

          {/* Contact Method / Price (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="post-contact" className="text-xs font-bold text-slate-700 block mb-1">
                Contact Method
              </label>
              <input
                id="post-contact"
                type="text"
                placeholder="e.g. WhatsApp 9123 4567 or Unit #12-04"
                value={contactMethod}
                onChange={e => setContactMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>

            <div>
              <label htmlFor="post-price" className="text-xs font-bold text-slate-700 block mb-1">
                Rate / Price / Free
              </label>
              <input
                id="post-price"
                type="text"
                placeholder="e.g. $60/hr or Free Giveaway"
                value={priceOrBudget}
                onChange={e => setPriceOrBudget(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="post-tags" className="text-xs font-bold text-slate-700 block mb-1">
              Tags (comma separated)
            </label>
            <input
              id="post-tags"
              type="text"
              placeholder="e.g. Tennis, Coaching, Weekend"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              Publish Post to OLA Hub
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
