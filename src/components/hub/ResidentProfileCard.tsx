import React from 'react';
import { ResidentUser } from '../../types';
import { ShieldCheck, Plus, Store, MessageSquarePlus, Sparkles, Building2 } from 'lucide-react';

interface ResidentProfileCardProps {
  resident: ResidentUser;
  onOpenNewPost: () => void;
  onOpenNewBakery: () => void;
  totalPostsCount: number;
  totalBakeriesCount: number;
}

export const ResidentProfileCard: React.FC<ResidentProfileCardProps> = ({
  resident,
  onOpenNewPost,
  onOpenNewBakery,
  totalPostsCount,
  totalBakeriesCount,
}) => {
  return (
    <div
      id="resident-auth-status-card"
      className="p-5 sm:p-6 rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-900 via-slate-900 to-slate-900 text-white shadow-sm space-y-4"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Resident Avatar and Credentials */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-md ring-2 ring-white/20">
              {resident.initials}
            </div>
            {resident.isVerified && (
              <span
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-slate-900"
                title="Singpass & MCST Verified Resident"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{resident.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 font-semibold font-mono">
                  {resident.initials}
                </span>
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-300 border border-emerald-400/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {resident.role}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
              <span className="flex items-center gap-1 font-medium text-teal-200">
                <Building2 className="w-3.5 h-3.5 text-teal-400" />
                {resident.block} • Unit {resident.unit}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 text-[11px]">Singpass MCST Verified</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            type="button"
            id="hub-new-post-btn"
            onClick={onOpenNewPost}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-xs transition-colors cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>New Post</span>
          </button>
          <button
            type="button"
            id="hub-new-bakery-btn"
            onClick={onOpenNewBakery}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-xs transition-colors cursor-pointer"
          >
            <Store className="w-4 h-4 text-amber-400" />
            <span>List Home Bakery</span>
          </button>
        </div>
      </div>

      {/* Security & Access Banner Footer */}
      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-teal-200/90">
          <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>
            Logged in as verified resident. You have full posting and marketplace privileges in OLA Hub.
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          <span>{totalPostsCount} Active Feed Posts</span>
          <span>•</span>
          <span>{totalBakeriesCount} Resident Kitchens</span>
        </div>
      </div>
    </div>
  );
};
