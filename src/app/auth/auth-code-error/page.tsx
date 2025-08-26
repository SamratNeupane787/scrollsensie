export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-400">
            There was an error with the authentication process.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              Please try logging in again or contact support if the problem
              persists.
            </p>
            <a
              href="/dashboard"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-3 font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-block text-center"
            >
              Try Again
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

