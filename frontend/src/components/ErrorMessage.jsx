"use client";

import { AlertTriangle, X } from "lucide-react";

const ErrorMessage = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="mb-8 mx-auto max-w-2xl">
      <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 flex items-start gap-3 backdrop-blur-sm">
        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-300 mb-1">Error</h3>
          <p className="text-red-200 text-sm">{error}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-300 transition-colors duration-200 p-1 rounded hover:bg-red-900/30"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
