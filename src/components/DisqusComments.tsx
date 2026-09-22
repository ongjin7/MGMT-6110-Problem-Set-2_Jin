import React, { useEffect, useState } from 'react';
import { MessageSquareQuote, ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    disqus_config?: any;
    DISQUS?: {
      reset: (options: { reload: boolean; config?: any }) => void;
    };
  }
}

export const DisqusComments: React.FC = () => {
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    const disqusShortname = 'jinong';
    const pageUrl = 'https://mgmt-6110-problem-set-2-jin.vercel.app/';
    const pageIdentifier = 'home';

    const configureDisqus = function (this: any) {
      const target = (this && typeof this === 'object') ? this : {};
      target.page = target.page || {};
      target.page.url = pageUrl;
      target.page.identifier = pageIdentifier;
      return target;
    };

    window.disqus_config = configureDisqus;

    // If Disqus script has already been loaded, reset the thread with config without re-inserting script
    if (window.DISQUS) {
      try {
        window.DISQUS.reset({
          reload: true,
          config: configureDisqus,
        });
      } catch (err) {
        console.warn('Disqus reset error:', err);
      }
      return;
    }

    // Ensure the Disqus Universal Code embed script is inserted only once into DOM
    const scriptId = 'disqus-embed-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://${disqusShortname}.disqus.com/embed.js`;
      script.setAttribute('data-timestamp', String(Date.now()));
      script.async = true;
      script.onerror = () => {
        setHasLoadError(true);
      };
      (document.head || document.body).appendChild(script);
    }
  }, []);

  return (
    <section id="disqus-feedback-section" className="space-y-4 pt-2">
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
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

        {/* Disqus Comment Thread Container */}
        <div id="disqus_thread" className="min-h-[220px]" />

        {hasLoadError && (
          <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3.5 text-xs text-amber-800">
            Note: Live comment threads are optimized for your deployed domain. If third-party cookies or content blockers are enabled in your browser, the embed will activate smoothly on your production URL.
          </div>
        )}

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
