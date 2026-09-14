import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, MapPin, Building, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      id="ola-main-footer"
      className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-10 px-4 sm:px-6 mt-16"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Logo size="md" showBadge={false} variant="dark" />
            <p className="text-slate-400 text-xs mt-2 max-w-md">
              Resident companion portal designed specifically for OLA Executive Condominium, Anchorvale Crescent, Singapore 544651.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>S544651 • Cheng Lim LRT (SW1)</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Sengkang Planning Area</span>
            </div>
          </div>
        </div>

        {/* Official Provider Attributions (Exact licence requirements) */}
        <div className="pt-6 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Data Provider Licenses & Credits:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] leading-relaxed text-slate-400">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="font-bold text-slate-200 block mb-1">
                Land Transport Authority (LTA)
              </span>
              <p>
                Contains public sector information licensed under the Singapore Open Data Licence.
                Live bus arrival timings, bus stop locations, and route sequences sourced via LTA DataMall.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="font-bold text-slate-200 block mb-1">
                Singapore Land Authority (SLA)
              </span>
              <p>
                Contains map information and route calculations from OneMap © Singapore Land Authority.
                All location coordinates, boundaries, and street routing provided under SLA OneMap terms.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="font-bold text-slate-200 block mb-1">
                Meteorological Service Singapore (MSS)
              </span>
              <p>
                Contains real-time weather forecasts and official air temperature sensor data from the
                National Environment Agency and Meteorological Service Singapore via data.gov.sg under the Singapore Open Data Licence.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} OLA Buddy. Crafted for OLA Executive Condominium Residents (S544651).</p>
          <p>All upstream data fetched dynamically via secure serverless proxies.</p>
        </div>
      </div>
    </footer>
  );
};
