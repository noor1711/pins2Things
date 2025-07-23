"use client";

import { Sparkles, Palette, Zap } from "lucide-react";

const Loader = ({ message = "Loading recommendations..." }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Analyzing Your Aesthetic
          </h2>
          <Zap className="w-8 h-8 text-pink-600 animate-pulse" />
        </div>
        <p className="text-gray-600 text-lg mb-8">{message}</p>

        {/* Animated Loading Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>

      {/* Loading Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="border border-gray-200 bg-white rounded-lg overflow-hidden"
          >
            <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded bg-[length:200%_100%] animate-shimmer"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded w-3/4 bg-[length:200%_100%] animate-shimmer"></div>
              </div>
              <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="mt-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-purple-500" />
          <span className="text-gray-600 font-medium">
            Processing your Pinterest board...
          </span>
        </div>
        <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse"
            style={{ width: "60%" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
