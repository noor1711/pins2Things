"use client";

import { Sparkles, Zap } from "lucide-react";

const SkeletonGrid = ({ message = "Loading recommendations..." }) => {
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Product Recommendations
          </h2>
          <Zap className="w-6 h-6 text-pink-600 animate-pulse" />
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
            className="border border-gray-200 bg-white rounded-lg overflow-hidden h-full"
          >
            <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between min-h-[140px]">
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded bg-[length:200%_100%] animate-shimmer"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded w-3/4 bg-[length:200%_100%] animate-shimmer"></div>
              </div>
              <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonGrid;
