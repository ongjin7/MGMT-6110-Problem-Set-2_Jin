import React from 'react';
import { SystemHealth } from '../types';
import { X, CheckCircle2, AlertTriangle, XCircle, Shield, RefreshCw } from 'lucide-react';

interface HealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemHealth: SystemHealth | null;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const HealthModal: React.FC<HealthModalProps> = ({
  isOpen,
  onClose,
  systemHealth,
  onRefresh,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const integrations = systemHealth?.integrations;

  const getStatusBadge = (healthy?: boolean, answered?: boolean, configured?: boolean) => {
    if (healthy) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Operational (HTTP 200)
        </span>
      );
    }
    if (!configured) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
          Awaiting Vercel Key
        </span>
      );
    }
    if (answered) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Degraded
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        Unreachable
      </span>
    );
  };

  return (
    <div
      id="system-health-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Upstream Service Diagnostics</h2>
              <p className="text-xs text-slate-400">
                Live connectivity & authentication status reporting
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span>External Service</span>
            <span>Health & Status</span>
          </div>

          {/* 1. LTA DataMall */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">LTA DataMall Bus API</h3>
                <p className="text-[11px] text-slate-500">Live bus arrivals & route sequences</p>
              </div>
              {getStatusBadge(
                integrations?.lta_datamall?.healthy,
                integrations?.lta_datamall?.upstreamAnswered,
                integrations?.lta_datamall?.keyConfigured
              )}
            </div>
            <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
              <span className="font-semibold">Status:</span> {integrations?.lta_datamall?.message || 'Configured via LTA_ACCOUNT_KEY'}
            </div>
          </div>

          {/* 2. OneMap Search & Routing */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">OneMap Search & Routing</h3>
                <p className="text-[11px] text-slate-500">Singapore location resolution & directions</p>
              </div>
              {getStatusBadge(
                integrations?.onemap?.healthy,
                integrations?.onemap?.upstreamAnswered,
                integrations?.onemap?.keyConfigured
              )}
            </div>
            <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
              <span className="font-semibold">Status:</span> {integrations?.onemap?.message || 'Configured via ONEMAP_API_EMAIL & ONEMAP_API_PASSWORD'}
            </div>
          </div>

          {/* 3. data.gov.sg Weather Forecast */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">data.gov.sg 2-Hour Weather</h3>
                <p className="text-[11px] text-slate-500">Official NEA Sengkang weather forecast</p>
              </div>
              {getStatusBadge(
                integrations?.data_gov_sg_weather?.healthy,
                integrations?.data_gov_sg_weather?.upstreamAnswered,
                true
              )}
            </div>
            <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
              <span className="font-semibold">Status:</span> {integrations?.data_gov_sg_weather?.message || 'Operational'}
            </div>
          </div>

          {/* 4. data.gov.sg Air Temperature */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">data.gov.sg Air Temperature</h3>
                <p className="text-[11px] text-slate-500">Real-time official weather station readings</p>
              </div>
              {getStatusBadge(
                integrations?.data_gov_sg_temperature?.healthy,
                integrations?.data_gov_sg_temperature?.upstreamAnswered,
                true
              )}
            </div>
            <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
              <span className="font-semibold">Status:</span> {integrations?.data_gov_sg_temperature?.message || 'Operational'}
            </div>
          </div>

          {/* Security & Confidentiality Notice */}
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900">
            <span className="font-bold">Security Guardrail Active:</span> Credentials and tokens are securely managed server-side only in Vercel environment variables and are never transmitted to browser clients.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Updated {systemHealth?.timestamp ? new Date(systemHealth.timestamp).toLocaleTimeString() : 'now'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
