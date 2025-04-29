'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8 p-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                Something went wrong!
              </h2>
              <p className="mt-2 text-center text-sm text-gray-400">
                {error.message || 'An unexpected error occurred'}
              </p>
            </div>
            <div className="mt-8 space-y-6">
              <button
                onClick={reset}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 