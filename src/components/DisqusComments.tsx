import React, { useEffect, useState } from 'react';
import { MessageSquareQuote, ShieldCheck, AlertCircle } from 'lucide-react';

// ============================================================================
// DISQUS CONFIGURATION SETTINGS
// To change or update your Disqus thread details, update the values below:
// ============================================================================
export const DISQUS_SHORTNAME = 'jinong'; // Your Disqus site shortname registered at disqus.com
export const DISQUS_PAGE_URL = 'https://mgmt-6110-problem-set-2-jin.vercel.app/'; // Canonical live site URL (HTTPS, no query string)
export const DISQUS_PAGE_IDENTIFIER = 'home'; // Fixed thread identifier for the main feedback thread
export const DISQUS_PAGE_TITLE = 'OLA Buddy - Resident Community Feedback';

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
  const [isConfigMissing, setIsConfigMissing] = useState(false);

  useEffect(() => {
    // 1. Verify required shortname
    if (!DISQUS_SHORTNAME || DISQUS_SHORTNAME.trim() === '') {
      setIsConfigMissing(true);
      return;
    }
    setIsConfigMissing(false);

    // 2. Build the official Disqus configuration function
    const configureDisqus = function (this: any) {
      this.page = this.page || {};
      this.page.url = DISQUS_PAGE_URL;
      this.page.identifier = DISQUS_PAGE_IDENTIFIER;
      this.page.title = DISQUS_PAGE_TITLE;
    };

    // 3. Set global variables according to official Disqus specifications
    window.disqus_shortname = DISQUS_SHORTNAME;
    window.disqus_config = configureDisqus;

    const scriptId = 'dsq-embed-scr';
    const doc = document;

    // Helper to safely reset or load the thread via official API
    const initDisqusThread = () => {
      if (window.DISQUS && typeof window.DISQUS.reset === 'function') {
        try {
          window.DISQUS.reset({
            reload: true,
            config: configureDisqus,
          });
        } catch (err) {
          console.warn('Disqus reset error:', err);
        }
      }
    };

    // 4. Handle React lifecycle & SPA navigation:
    // If DISQUS already exists on the window, reload the thread into the current container
    if (window.DISQUS && doc.getElementById(scriptId)) {
      initDisqusThread();
      return;
    }

    // 5. If embed script tag is already in DOM (e.g. still downloading), attach load listener
    let script = doc.getElementById(scriptId) as HTMLScriptElement | null;
    if (script) {
      script.addEventListener('load', initDisqusThread);
      return () => {
        script?.removeEventListener('load', initDisqusThread);
      };
    }

    // 6. Otherwise inject the official Disqus embed script
    script = doc.createElement('script');
    script.id = scriptId;
    script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
    script.setAttribute('data-timestamp', String(+new Date()));
    script.async = true;
    script.addEventListener('load', initDisqusThread);

    (doc.head || doc.body).appendChild(script);

    return () => {
      if (script) {
        script.removeEventListener('load', initDisqusThread);
      }
    };
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

        {/* Configuration Notice (only rendered if shortname is omitted) */}
        {isConfigMissing ? (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Disqus Shortname Required</p>
              <p className="mt-1 text-amber-800">
                Please provide your Disqus shortname in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">src/components/DisqusComments.tsx</code> at <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">DISQUS_SHORTNAME</code>.
              </p>
            </div>
          </div>
        ) : (
          /* Official Disqus Comment Container */
          <div id="disqus_thread" className="min-h-[240px]" />
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
