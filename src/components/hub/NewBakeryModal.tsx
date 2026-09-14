import React, { useState } from 'react';
import { HomeBakeryListing, ResidentUser } from '../../types';
import { X, Store, ShieldCheck, Sparkles, Image as ImageIcon } from 'lucide-react';

interface NewBakeryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bakery: HomeBakeryListing) => void;
  currentUser: ResidentUser;
}

const PRESET_BAKERY_PHOTOS = [
  {
    label: 'Artisanal Sourdough & Bread',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Cakes & Pastries',
    url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Specialty Coffee & Drinks',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Cookies & Brownies',
    url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
  },
];

export const NewBakeryModal: React.FC<NewBakeryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [whatTheySell, setWhatTheySell] = useState('');
  const [itemsSummary, setItemsSummary] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_BAKERY_PHOTOS[0].url);
  const [priceRange, setPriceRange] = useState('');
  const [pickupDeliveryDetails, setPickupDeliveryDetails] = useState('');
  const [operatingDays, setOperatingDays] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [specialtyHighlight, setSpecialtyHighlight] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !whatTheySell.trim()) return;

    const items = itemsSummary
      .split(',')
      .map(i => i.trim())
      .filter(Boolean);

    const newListing: HomeBakeryListing = {
      id: `bakery-${Date.now()}`,
      businessName: businessName.trim(),
      sellerName: `${currentUser.name} (${currentUser.initials})`,
      sellerInitials: currentUser.initials,
      sellerUnit: `${currentUser.block} ${currentUser.unit}`,
      whatTheySell: whatTheySell.trim(),
      itemsSummary: items.length > 0 ? items : ['Signature Home Bakes'],
      photos: [selectedPhoto],
      priceRange: priceRange.trim() || '$10 – $25',
      pickupDeliveryDetails:
        pickupDeliveryDetails.trim() || `Self-pickup at ${currentUser.block} lobby or doorstep delivery in OLA`,
      operatingDays: operatingDays.trim() || 'Weekends & Evenings',
      contactMethod: contactMethod.trim() || 'WhatsApp or chat in OLA Hub',
      isResidentRun: true,
      specialtyHighlight: specialtyHighlight.trim() || 'Freshly made with premium ingredients',
    };

    onSubmit(newListing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="new-home-bakery-modal"
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Register Home Café / Bakery</h3>
              <p className="text-xs text-slate-500">Showcase your culinary offerings to OLA neighbours</p>
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
          {/* Resident Run Guarantee */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200/70 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-emerald-900">
                Automatic “Resident-run” Verified Badge included
              </span>
            </div>
            <span className="font-bold text-slate-700">
              {currentUser.block} {currentUser.unit}
            </span>
          </div>

          {/* Business Name */}
          <div>
            <label htmlFor="bakery-name" className="text-xs font-bold text-slate-700 block mb-1">
              Business / Kitchen Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="bakery-name"
              type="text"
              required
              placeholder="e.g. Anchorvale Crust & Crumb"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          {/* What They Sell */}
          <div>
            <label htmlFor="bakery-items" className="text-xs font-bold text-slate-700 block mb-1">
              What Do You Sell? <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="bakery-items"
              required
              rows={3}
              placeholder="Describe your offerings (e.g. Sourdough country loaves, focaccia with fresh herbs, matcha cookies)..."
              value={whatTheySell}
              onChange={e => setWhatTheySell(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          {/* Signature items summary */}
          <div>
            <label htmlFor="bakery-summary-tags" className="text-xs font-bold text-slate-700 block mb-1">
              Signature Item Highlights (comma separated)
            </label>
            <input
              id="bakery-summary-tags"
              type="text"
              placeholder="e.g. Country Sourdough ($12), Cinnamon Buns ($15), Sea Salt Focaccia ($14)"
              value={itemsSummary}
              onChange={e => setItemsSummary(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          {/* Select Photo */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Cover Photo Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_BAKERY_PHOTOS.map(p => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => setSelectedPhoto(p.url)}
                  className={`relative aspect-16/9 rounded-xl overflow-hidden border-2 text-left transition-all ${
                    selectedPhoto === p.url
                      ? 'border-amber-500 ring-2 ring-amber-400/30'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p.url} alt={p.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                    <span className="text-[10px] font-bold text-white drop-shadow leading-tight">
                      {p.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range & Operating Days */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="bakery-price" className="text-xs font-bold text-slate-700 block mb-1">
                Price Range <span className="text-rose-500">*</span>
              </label>
              <input
                id="bakery-price"
                type="text"
                required
                placeholder="e.g. $10 – $22"
                value={priceRange}
                onChange={e => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="bakery-days" className="text-xs font-bold text-slate-700 block mb-1">
                Operating Days <span className="text-rose-500">*</span>
              </label>
              <input
                id="bakery-days"
                type="text"
                required
                placeholder="e.g. Friday to Sunday"
                value={operatingDays}
                onChange={e => setOperatingDays(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Pickup / Delivery Details */}
          <div>
            <label htmlFor="bakery-pickup" className="text-xs font-bold text-slate-700 block mb-1">
              Pickup / Delivery Details <span className="text-rose-500">*</span>
            </label>
            <input
              id="bakery-pickup"
              type="text"
              required
              placeholder="e.g. Tower 3 lift lobby collection or doorstep drop in OLA"
              value={pickupDeliveryDetails}
              onChange={e => setPickupDeliveryDetails(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          {/* Contact Method & Specialty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="bakery-contact" className="text-xs font-bold text-slate-700 block mb-1">
                Contact Method <span className="text-rose-500">*</span>
              </label>
              <input
                id="bakery-contact"
                type="text"
                required
                placeholder="e.g. WhatsApp 9123 4567 / IG @mybakes"
                value={contactMethod}
                onChange={e => setContactMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="bakery-specialty" className="text-xs font-bold text-slate-700 block mb-1">
                Specialty Highlight
              </label>
              <input
                id="bakery-specialty"
                type="text"
                placeholder="e.g. 100% Organic French Butter"
                value={specialtyHighlight}
                onChange={e => setSpecialtyHighlight(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
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
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              Publish Bakery Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
