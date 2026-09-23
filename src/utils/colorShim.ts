// Shim for legacy third-party scripts (such as Disqus embed.js) that cannot parse modern CSS Color 4 formats (OKLCH, OKLab, color())
let helperCanvas: HTMLCanvasElement | null = null;
let helperCtx: CanvasRenderingContext2D | null = null;

function convertCssColorToRgb(val: string, fallback: string): string {
  if (!val || typeof val !== 'string') return val;
  const trimmed = val.trim();
  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('rgb(') ||
    trimmed.startsWith('rgba(') ||
    trimmed === 'transparent'
  ) {
    return val;
  }
  if (/oklch|oklab|color\(|lch\(|lab\(/i.test(trimmed)) {
    try {
      if (!helperCtx && typeof document !== 'undefined') {
        helperCanvas = document.createElement('canvas');
        helperCanvas.width = 1;
        helperCanvas.height = 1;
        helperCtx = helperCanvas.getContext('2d');
      }
      if (helperCtx) {
        helperCtx.fillStyle = '#000000';
        helperCtx.fillStyle = trimmed;
        const converted = helperCtx.fillStyle;
        if (converted && (converted.startsWith('#') || converted.startsWith('rgb'))) {
          return converted;
        }
      }
    } catch {
      // fallback on error
    }
    return fallback;
  }
  return val;
}

if (typeof window !== 'undefined' && typeof CSSStyleDeclaration !== 'undefined') {
  const originalGetPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue;
  CSSStyleDeclaration.prototype.getPropertyValue = function (property: string): string {
    const val = originalGetPropertyValue.call(this, property);
    if (val && typeof val === 'string' && /color|background/i.test(property)) {
      if (/oklch|oklab|color\(|lch\(|lab\(/i.test(val)) {
        return convertCssColorToRgb(
          val,
          /background/i.test(property) ? 'rgb(255, 255, 255)' : 'rgb(51, 65, 85)'
        );
      }
    }
    return val;
  };

  ['color', 'backgroundColor'].forEach((prop) => {
    const desc = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, prop);
    if (desc && desc.get) {
      const origGet = desc.get;
      Object.defineProperty(CSSStyleDeclaration.prototype, prop, {
        configurable: true,
        enumerable: true,
        get() {
          const val = origGet.call(this);
          if (val && typeof val === 'string' && /oklch|oklab|color\(|lch\(|lab\(/i.test(val)) {
            return convertCssColorToRgb(
              val,
              prop === 'backgroundColor' ? 'rgb(255, 255, 255)' : 'rgb(51, 65, 85)'
            );
          }
          return val;
        },
        set: desc.set
          ? function (this: CSSStyleDeclaration, v: string) {
              return desc.set!.call(this, v);
            }
          : undefined,
      });
    }
  });

  // Catch cross-origin script errors (e.g. from third-party widgets) to prevent unhandled Script errors
  window.addEventListener(
    'error',
    (event) => {
      if (
        event.message === 'Script error.' ||
        (event.filename &&
          (event.filename.includes('disqus') ||
            event.filename.includes('disquscdn') ||
            event.filename.includes('clarity')))
      ) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
    },
    true
  );
}

export {};
