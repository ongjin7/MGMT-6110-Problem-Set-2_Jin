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
      className="p-5 sm:p-6 rounded-3xl border border-rose-200/70 bg-gradient-to-br from-rose-50/90 via-amber-50/70 to-teal-50/90 text-slate-800 shadow-xs space-y-4"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Resident Avatar and Credentials */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-teal-100 via-emerald-100 to-amber-100 text-teal-800 font-extrabold text-xl flex items-center justify-center shadow-xs ring-4 ring-white border border-teal-200/60">
              {resident.initials}
            </div>
            {resident.isVerified && (
              <span
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 text-white flex items-center justify-center ring-2 ring-white shadow-2xs"
                title="Singpass & MCST Verified Resident"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                <span>{resident.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/90 text-teal-700 border border-teal-200/80 font-semibold font-mono shadow-2xs">
                  {resident.initials}
                </span>
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200/80">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {resident.role}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
              <span className="inline-flex items-center gap-1 font-medium text-teal-800 bg-white/70 px-2 py-0.5 rounded-full border border-teal-100">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                {resident.block} • Unit {resident.unit}
              </span>
              <span className="text-rose-300">•</span>
              <span className="text-slate-500 text-[11px] font-medium">Singpass MCST Verified</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <button
            type="button"
            id="hub-new-post-btn"
            onClick={onOpenNewPost}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition-all cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>New Post</span>
          </button>
          <button
            type="button"
            id="hub-new-bakery-btn"
            onClick={onOpenNewBakery}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold bg-amber-100/90 hover:bg-amber-200/80 text-amber-900 border border-amber-200/90 shadow-2xs transition-all cursor-pointer"
          >
            <Store className="w-4 h-4 text-amber-600" />
            <span>List Home Bakery</span>
          </button>
        </div>
      </div>

      {/* Security & Access Banner Footer */}
      <div className="px-3.5 py-2.5 rounded-2xl bg-white/75 border border-rose-100/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            Logged in as verified resident. You have full posting and marketplace privileges in OLA Hub.
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 font-mono text-[11px]">
          <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-100">
            {totalPostsCount} Active Feed Posts
          </span>
          <span className="text-rose-300">•</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
            {totalBakeriesCount} Resident Kitchens
          </span>
        </div>
      </div>
    </div>
  );
};
