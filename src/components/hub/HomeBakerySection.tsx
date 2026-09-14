import React, { useState } from 'react';
import { HomeBakeryListing } from '../../types';
import {
  Store,
  ShieldCheck,
  Tag,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Sparkles,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface HomeBakerySectionProps {
  bakeries: HomeBakeryListing[];
  onOpenNewBakery: () => void;
}

export const HomeBakerySection: React.FC<HomeBakerySectionProps> = ({
  bakeries,
  onOpenNewBakery,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyContact = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="home-cafes-bakeries-section" className="space-y-5 pt-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Store className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Resident Home Cafés & Bakeries
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              OLA Kitchens
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Support your neighbours: artisanal sourdoughs, handcrafted pastries, specialty coffee, and sweet treats baked right inside OLA.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewBakery}
          id="hub-list-kitchen-cta"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          <Store className="w-4 h-4 text-amber-600" />
          <span>Register Home Bakery</span>
        </button>
      </div>

      {/* Grid of Resident Bakeries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bakeries.map(bakery => (
          <article
            key={bakery.id}
            id={`bakery-card-${bakery.id}`}
            className="group rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md hover:border-teal-300/80 transition-all duration-200 overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Photo Banner with Badges */}
              <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-100">
                <img
                  src={bakery.photos[0]}
                  alt={bakery.businessName}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30" />

                {/* Badges Over Image */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  {/* Resident-run Badge (Requested Mandatory) */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/95 text-white shadow-sm backdrop-blur-xs ring-1 ring-white/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    <span>Resident-run</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900/80 text-white backdrop-blur-xs border border-white/20">
                    {bakery.sellerUnit}
                  </span>
                </div>

                {/* Price Range Badge Bottom Right */}
                <div className="absolute bottom-3 right-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black bg-white/95 text-slate-900 shadow-sm">
                    <Tag className="w-3.5 h-3.5 text-teal-600" />
                    <span>{bakery.priceRange}</span>
                  </span>
                </div>

                {/* Business Name bottom left */}
                <div className="absolute bottom-3 left-3 right-28">
                  <h3 className="text-lg font-black text-white drop-shadow-md leading-tight">
                    {bakery.businessName}
                  </h3>
                  <p className="text-xs text-slate-200 font-medium drop-shadow">
                    By {bakery.sellerName} ({bakery.sellerUnit})
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                {/* Specialty Highlight */}
                {bakery.specialtyHighlight && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200/70">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{bakery.specialtyHighlight}</span>
                  </div>
                )}

                {/* What they sell */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    What They Sell:
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {bakery.whatTheySell}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {bakery.itemsSummary.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200/70"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  {/* Operating Days */}
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">Operating Days: </span>
                      <span>{bakery.operatingDays}</span>
                    </div>
                  </div>

                  {/* Pickup / Delivery Details */}
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">Pickup / Delivery: </span>
                      <span>{bakery.pickupDeliveryDetails}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Method Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200/80 rounded-b-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{bakery.contactMethod}</span>
              </div>

              <button
                type="button"
                onClick={() => handleCopyContact(bakery.id, bakery.contactMethod)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                title="Copy Contact Info"
              >
                {copiedId === bakery.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <span>Copy Contact</span>
                  </>
                )}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
