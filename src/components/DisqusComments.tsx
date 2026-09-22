import React, { useEffect } from 'react';
import { MessageSquareQuote, ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    disqus_shortname?: string;
    disqus_config?: (this: any) => void;
    DISQUS?: {
      reset: (options: { reload: boolean; config?: (this: any) => void }) => void;
    };
  }
}

export const DisqusComments: React.FC = () => {
  useEffect(() => {
    // Canonical live site URL
    const pageUrl = 'https://mgmt-6110-problem-set-2-jin.vercel.app/';
    const pageIdentifier = 'ola-buddy-feedback';

    // 1. Configure Disqus page parameters
    const configureDisqus = function (this: any) {
      this.page.url = pageUrl;
      this.page.identifier = pageIdentifier;
    };

    // 2. Set global configuration for Disqus
    window.disqus_shortname = 'jinong';
    window.disqus_config = configureDisqus;

    const scriptId = 'dsq-embed-scr';

    // 3. If Disqus is already loaded in the window, reset the thread
    if (window.DISQUS && typeof window.DISQUS.reset === 'function') {
      window.DISQUS.reset({
        reload: true,
        config: configureDisqus,
      });
      return;
    }

    // 4. Ensure the embed script is injected only once
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = 'https://jinong.disqus.com/embed.js';
      s.setAttribute('data-timestamp', String(+new Date()));
      s.async = true;
      (document.head || document.body).appendChild(s);
    }
  }, []);

  return (
    <section
      id="disqus-feedback-section"
      className="space-y-4 pt-2"
      style={{ color: '#334155', backgroundColor: '#ffffff' }}
    >
      <style>{`
        #disqus-feedback-section,
        #disqus-feedback-section *,
        #disqus_thread,
        #disqus_thread * {
          color: #334155;
        }
        #disqus_thread {
          color: #334155 !important;
          background-color: #ffffff !important;
        }
        #disqus-feedback-section a,
        #disqus_thread a {
          color: #0d9488 !important;
        }
      `}</style>
      <div
        className="rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5"
        style={{ color: '#334155', backgroundColor: '#ffffff' }}
      >
        {/* Header with Title and Category */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-teal-700 uppercase tracking-wider">
                  FEEDBACK
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                  <ShieldCheck className="w-3 h-3 text-teal-600" />
                  Verified Thread
                </span>
              </div>
            </div>
          </div>
          <span className="self-start sm:self-auto text-xs text-slate-500 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-lg">
            Single Discussion Thread
          </span>
        </div>

        {/* Short invitation line directly above the thread */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 sm:p-4 border border-slate-200/60">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            <span className="font-semibold text-slate-900">We'd love your thoughts:</span> Please share what worked for you and what did not so we can continue refining the experience.
          </p>
        </div>

        {/* Single canonical Disqus comment container with explicit standard HEX styles */}
        <div
          id="disqus_thread"
          className="min-h-[280px]"
          style={{ color: '#334155', backgroundColor: '#ffffff' }}
        />

        <noscript>
          <p className="text-xs text-slate-500">
            Please enable JavaScript to view the{' '}
            <a
              href="https://disqus.com/?ref_noscript"
              rel="noreferrer"
              target="_blank"
              className="text-teal-600 underline font-medium"
            >
              comments powered by Disqus.
            </a>
          </p>
        </noscript>
      </div>
    </section>
  );
};

