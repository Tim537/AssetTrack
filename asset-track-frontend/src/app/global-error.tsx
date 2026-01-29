'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const GlobalError = ({ error, reset }: GlobalErrorProps) => {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="de" className="dark">
      <body className="antialiased">
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <svg
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-white mb-2">
                Anwendungsfehler
              </h1>
              <p className="text-zinc-400 mb-4">
                Ein kritischer Fehler ist aufgetreten. Bitte versuche es erneut.
              </p>
              {error.message && (
                <div className="rounded-md bg-zinc-800 p-3 mb-4">
                  <p className="text-sm font-mono text-zinc-400 break-all">
                    {error.message}
                  </p>
                </div>
              )}
              <div className="flex gap-2 justify-center">
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition-colors"
                >
                  Erneut versuchen
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 bg-white text-black rounded-md hover:bg-zinc-200 transition-colors"
                >
                  Zur Startseite
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
