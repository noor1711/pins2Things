"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const RecommendationGrid = ({ itemGroups }) => {
  if (!itemGroups || itemGroups.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 md:p-6">
        <p className="text-sm text-neutral-400">
          No recommendations yet. Try a different board.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6" aria-live="polite">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-emerald-700">
          Recommendations
        </h2>
        <p className="text-sm text-neutral-400">
          {itemGroups.reduce((acc, group) => acc + group.cards.length, 0)} items
          that match your vibe
        </p>
      </div>
      {itemGroups.map((group) => {
        const items = group.cards;
        const description = group.description;
        return (
          <>
            <h3 className="text-center text-2xl md:text-3xl lg:text-4xl font-bold text-emerald-600 text-transform-capitalize mt-7 mb-3">
              {description}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="border border-2 overflow-hidden shadow-2xl border-neutral-800 bg-[#f5f1e2] rounded-xl transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <img
                        src={
                          item?.image ||
                          "/placeholder.svg?height=240&width=320&query=dark-product-image-placeholder"
                        }
                        alt={item?.title || "Product image"}
                        className="w-full h-48 object-cover transition-transform duration-300 hover:scale-[1.03]"
                        loading="lazy"
                        style={{ aspectRatio: "4/3" }}
                      />
                      <div className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                    <div className="p-4 space-y-3">
                      <h3 className="text-base font-semibold text-neutral-800 line-clamp-2">
                        {item?.title}
                      </h3>
                      <Link
                        target="_blank"
                        href={item?.link || "#"}
                        className="block"
                      >
                        <Button className="w-full text-neutral-100 border-2 border-black bg-emerald-700 hover:bg-emerald-600">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        );
      })}
    </div>
  );
};

export default RecommendationGrid;
