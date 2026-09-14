import React from 'react';
import { Loader2, Inbox, ShieldAlert, WifiOff, RefreshCw } from 'lucide-react';
import { FetchState } from '../types';

interface DataStateNoticeProps {
  id?: string;
  state: FetchState;
  upstreamStatus?: number | null;
  customContext?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export const DataStateNotice: React.FC<DataStateNoticeProps> = ({
  id,
  state,
  upstreamStatus,
  customContext,
  onRetry,
  compact = false,
}) => {
  if (state === 'idle' || state === 'success') {
    return null;
  }

  // Exact 4 distinct sentences as demanded by prompt
  const sentences = {
    loading: 'Fetching the latest live data from official Singapore government services...',
    empty: 'No data records were returned for this request from the official database.',
    refused: upstreamStatus
      ? `The upstream service refused the request due to authentication or query parameters (HTTP ${upstreamStatus}).`
      : 'The upstream service refused the request due to authentication or query parameters.',
    unreachable:
      'The upstream service could not be reached due to a network connection issue or missing service configuration.',
  };

  const icons = {
    loading: <Loader2 className="w-5 h-5 text-teal-600 animate-spin shrink-0" />,
    empty: <Inbox className="w-5 h-5 text-slate-400 shrink-0" />,
    refused: <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />,
    unreachable: <WifiOff className="w-5 h-5 text-amber-500 shrink-0" />,
  };

  const styles = {
    loading: 'bg-teal-50/80 border-teal-200 text-teal-900',
    empty: 'bg-slate-50 border-slate-200 text-slate-700',
    refused: 'bg-rose-50 border-rose-200 text-rose-900',
    unreachable: 'bg-amber-50 border-amber-200 text-amber-900',
  };

  if (compact) {
    return (
      <div
        id={id}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${styles[state]}`}
      >
        {icons[state]}
        <p className="text-xs leading-relaxed flex-1 font-medium">{sentences[state]}</p>
        {onRetry && state !== 'loading' && (
          <button
            type="button"
            onClick={onRetry}
            className="p-1 text-xs hover:bg-black/5 rounded transition-colors text-slate-700"
            title="Retry request"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      id={id}
      className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${styles[state]}`}
    >
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 rounded-lg bg-white/70 shadow-2xs shrink-0">
          {icons[state]}
        </div>
        <div>
          {customContext && (
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75 mb-0.5">
              {customContext}
            </span>
          )}
          <p className="text-sm font-medium leading-relaxed">{sentences[state]}</p>
        </div>
      </div>

      {onRetry && state !== 'loading' && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white shadow-2xs hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all shrink-0 self-end sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Retry Request
        </button>
      )}
    </div>
  );
};
