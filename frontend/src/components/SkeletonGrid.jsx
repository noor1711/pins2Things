"use client";

const SkeletonGrid = ({ message = "Loading recommendations..." }) => {
  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 animate-pulse" />
        <p className="text-sm text-neutral-400">{message}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="border border-2 border-neutral-800 rounded-xl overflow-hidden bg-cream"
          >
            <div className="w-full h-48 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer" />
            <div className="p-4 space-y-3">
              <div className="h-5 rounded w-3/4 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer" />
              <div className="h-4 rounded w-1/2 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer" />
              <div className="h-10 rounded bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonGrid;
