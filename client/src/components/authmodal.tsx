
interface AuthModalProps {
    onClose: () => void;
    onSuccess: () => void;
  }
  
  function AuthModal({ onClose, onSuccess }: AuthModalProps) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Sign In</h2>
          <p className="mb-6">Connect your accounts to get the most out of Bloke!</p>
          <div className="space-y-4">
            <button 
              className="w-full py-2 px-4 bg-blue-600 text-white rounded flex items-center justify-center gap-2"
              onClick={onSuccess}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" />
              </svg>
              Continue with Email
            </button>
            <button 
              className="w-full py-2 px-4 bg-red-600 text-white rounded flex items-center justify-center gap-2"
              onClick={onSuccess}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.35 11.3c0 2.51-1.49 4.41-3.89 4.41-1.95 0-3.75-1.38-3.75-3.65 0-2.14 1.77-3.93 3.75-3.93.47 0 .9.09 1.29.23l-.73.73-.31.35c-.17-.05-.35-.08-.54-.08-.93 0-1.73.8-1.73 1.73 0 .93.8 1.73 1.73 1.73.76 0 1.39-.49 1.61-1.17H12v-.94h4.47c.07.31.11.61.11.91z" />
              </svg>
              Continue with Gmail
            </button>
            <button 
              className="w-full py-2 px-4 bg-blue-800 text-white rounded flex items-center justify-center gap-2"
              onClick={onSuccess}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
              Continue with Outlook
            </button>
            <button 
              className="w-full py-2 px-4 bg-gray-800 text-white rounded flex items-center justify-center gap-2"
              onClick={onSuccess}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>
          </div>
          <button 
            className="mt-6 text-sm text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
  
export default AuthModal;