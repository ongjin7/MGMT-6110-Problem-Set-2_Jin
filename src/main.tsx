import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept cross-origin script errors (e.g. Disqus iframe or content blockers)
const prevOnError = window.onerror;
window.onerror = function (message, source, lineno, colno, error) {
  if (
    message === 'Script error.' ||
    (typeof source === 'string' && (source.includes('disqus') || source.includes('disquscdn')))
  ) {
    return true;
  }
  if (typeof prevOnError === 'function') {
    return prevOnError(message, source, lineno, colno, error);
  }
  return false;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
