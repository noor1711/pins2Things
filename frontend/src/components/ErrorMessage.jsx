"use client";

import { AlertCircle, X } from "lucide-react";

const ErrorMessage = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="mb-8 mx-auto max-w-2xl">
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-800 mb-1">Error</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 transition-colors duration-200"
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
