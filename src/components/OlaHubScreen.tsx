import React, { useState } from 'react';
import { ForumCategory, ForumPost, HomeBakeryListing, ResidentUser } from '../types';
import { CURRENT_RESIDENT, INITIAL_FORUM_POSTS, INITIAL_HOME_BAKERIES } from '../data/hubData';
import { ResidentProfileCard } from './hub/ResidentProfileCard';
import { HomeBakerySection } from './hub/HomeBakerySection';
import { NewPostModal } from './hub/NewPostModal';
import { NewBakeryModal } from './hub/NewBakeryModal';
import {
  Users,
  Search,
  MessageSquare,
  ThumbsUp,
  Tag,
  ShieldCheck,
  Send,
  Sparkles,
  Phone,
  Store,
  Compass,
} from 'lucide-react';

export const OlaHubScreen: React.FC = () => {
  const [currentUser] = useState<ResidentUser>(CURRENT_RESIDENT);
  const [posts, setPosts] = useState<ForumPost[]>(INITIAL_FORUM_POSTS);
  const [bakeries, setBakeries] = useState<HomeBakeryListing[]>(INITIAL_HOME_BAKERIES);
  const [activeCategory, setActiveCategory] = useState<ForumCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [isNewBakeryOpen, setIsNewBakeryOpen] = useState(false);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Filtering posts
  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  // Handle Likes
  const handleToggleLike = (postId: string) => {
    setLikedPostIds(prev => {
      const next = new Set(prev);
      const isLiked = next.has(postId);
      if (isLiked) {
        next.delete(postId);
      } else {
        next.add(postId);
      }

      setPosts(currentPosts =>
        currentPosts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
            };
          }
          return p;
        })
      );

      return next;
    });
  };

  // Handle adding comments
  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;

    setPosts(currentPosts =>
      currentPosts.map(p => {
        if (p.id === postId) {
          const newComment = {
            id: `comment-${Date.now()}`,
            authorName: `${currentUser.name} (${currentUser.initials})`,
            authorInitials: currentUser.initials,
            authorUnit: `${currentUser.block} ${currentUser.unit}`,
            content: commentText.trim(),
            createdAt: 'Just now',
          };
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [...(p.comments || []), newComment],
          };
        }
        return p;
      })
    );

    setCommentText('');
  };

  // Add new post
  const handleCreatePost = (
    newPostData: Omit<ForumPost, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>
  ) => {
    const newPost: ForumPost = {
      ...newPostData,
      id: `post-${Date.now()}`,
      createdAt: 'Just now',
      likesCount: 1,
      commentsCount: 0,
      comments: [],
    };
    setPosts([newPost, ...posts]);
  };

  // Add new bakery listing
  const handleCreateBakery = (newBakery: HomeBakeryListing) => {
    setBakeries([newBakery, ...bakeries]);
  };

  const getCategoryBadgeColor = (category: ForumPost['category']) => {
    switch (category) {
      case 'expertise':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'lost_found':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'recommendations':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'marketplace':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'events':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div id="ola-hub-screen-container" className="space-y-8 pb-12">
      {/* Screen Header */}
      <div className="pb-2 border-b border-slate-200 space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
          <Users className="w-4 h-4" />
          <span>Resident Community Network</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            OLA Hub
          </h1>
          <span className="text-xs sm:text-sm text-slate-500">
            Exclusive private portal for OLA Executive Condominium residents
          </span>
        </div>
      </div>

      {/* 1. Logged-in Resident Interface Banner (Initials: OJ) */}
      <ResidentProfileCard
        resident={currentUser}
        onOpenNewPost={() => setIsNewPostOpen(true)}
        onOpenNewBakery={() => setIsNewBakeryOpen(true)}
        totalPostsCount={posts.length}
        totalBakeriesCount={bakeries.length}
      />

      {/* 2. Community Feed & Forum Section */}
      <section id="community-feed-section" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-700" />
              <span>Community Feed & Noticeboard</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Browse lost and found, neighbour recommendations, upcoming events, buy/sell/giveaway, and resident coaching.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search posts, tennis, aircon..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Posts' },
            { id: 'expertise', label: '🎾 Resident Expertise' },
            { id: 'lost_found', label: '🔍 Lost & Found' },
            { id: 'recommendations', label: '⭐ Recommendations' },
            { id: 'marketplace', label: '🛍️ Buy / Sell / Giveaway' },
            { id: 'events', label: '🎉 Community Events' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id as ForumCategory)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feed Posts List */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 bg-white">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No posts found in this category</p>
              <p className="text-xs text-slate-500 mt-1">Be the first neighbour to post!</p>
              <button
                type="button"
                onClick={() => setIsNewPostOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700"
              >
                Create New Post
              </button>
            </div>
          ) : (
            filteredPosts.map(post => {
              const isLiked = likedPostIds.has(post.id);
              const isCommentOpen = activeCommentPostId === post.id;

              return (
                <article
                  key={post.id}
                  id={`forum-post-${post.id}`}
                  className={`p-5 rounded-2xl border transition-all duration-200 bg-white shadow-xs ${
                    post.isCurrentUser
                      ? 'border-teal-300/80 ring-1 ring-teal-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Metadata Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar initials circle */}
                      <div
                        className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                          post.isCurrentUser
                            ? 'bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 ring-1 ring-teal-400'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                      >
                        {post.authorInitials}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">
                            {post.authorName}
                          </span>
                          {post.isCurrentUser && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                              You
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500 font-medium">
                            {post.authorUnit}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">{post.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeColor(
                          post.category
                        )}`}
                      >
                        {post.categoryLabel}
                      </span>
                    </div>
                  </div>

                  {/* Post Title & Content */}
                  <div className="space-y-2 mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>

                    {/* Price / Rate highlight if present */}
                    {post.price && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{post.price}</span>
                      </div>
                    )}

                    {/* Contact Method if present */}
                    {post.contactMethod && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="font-medium">{post.contactMethod}</span>
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Footer Actions: Like, Comment, Status */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      {/* Helpful / Like Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleLike(post.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                          isLiked
                            ? 'bg-teal-50 text-teal-700 border border-teal-200 ring-1 ring-teal-500/20'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-teal-700' : ''}`} />
                        <span>{isLiked ? 'Helpful' : 'Mark Helpful'}</span>
                        <span className="font-mono text-[11px] text-slate-500">
                          ({post.likesCount})
                        </span>
                      </button>

                      {/* Comments Toggle Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setActiveCommentPostId(isCommentOpen ? null : post.id)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>Replies</span>
                        <span className="font-mono text-[11px] text-slate-500">
                          ({post.commentsCount})
                        </span>
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      Verified Resident Post
                    </span>
                  </div>

                  {/* Collapsible Comments Section */}
                  {isCommentOpen && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 bg-slate-50/60 p-4 rounded-xl">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Resident Replies ({post.comments?.length || 0})
                      </span>

                      {/* Comment list */}
                      {post.comments && post.comments.length > 0 ? (
                        <div className="space-y-2">
                          {post.comments.map(c => (
                            <div
                              key={c.id}
                              className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">
                                  {c.authorName}{' '}
                                  <span className="text-slate-400 font-normal">({c.authorUnit})</span>
                                </span>
                                <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                              </div>
                              <p className="text-slate-700 leading-relaxed">{c.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">
                          No replies yet. Be the first to answer your neighbour!
                        </p>
                      )}

                      {/* Reply Box as OJ */}
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          placeholder={`Reply as ${currentUser.name} (${currentUser.initials})...`}
                          value={activeCommentPostId === post.id ? commentText : ''}
                          onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleAddComment(post.id);
                          }}
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(post.id)}
                          className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* 3. Resident Home Cafés & Bakeries Section */}
      <HomeBakerySection
        bakeries={bakeries}
        onOpenNewBakery={() => setIsNewBakeryOpen(true)}
      />

      {/* Modals */}
      <NewPostModal
        isOpen={isNewPostOpen}
        onClose={() => setIsNewPostOpen(false)}
        onSubmit={handleCreatePost}
        currentUser={currentUser}
      />

      <NewBakeryModal
        isOpen={isNewBakeryOpen}
        onClose={() => setIsNewBakeryOpen(false)}
        onSubmit={handleCreateBakery}
        currentUser={currentUser}
      />
    </div>
  );
};
