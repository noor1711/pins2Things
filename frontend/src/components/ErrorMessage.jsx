"use client";

import { AlertTriangle, X } from "lucide-react";

const ErrorMessage = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="mb-8 mx-auto max-w-2xl text-neutral-100">
      <div className="bg-red-300 border border-red-600 border-2 rounded-xl p-4 flex items-start gap-3 backdrop-blur-sm">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Error</h3>
          <p className="text-sm">{error}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="hover:text-neutral-700 duration-200 p-1 rounded"
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
