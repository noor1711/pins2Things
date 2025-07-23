"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
import Link from "next/link";

const RecommendationGrid = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Product Recommendations
          </h2>
          <Zap className="w-6 h-6 text-pink-600" />
        </div>
        <p className="text-gray-600 text-lg">
          Discover products that match your aesthetic perfectly
        </p>
      </div>

      {/* Recommendation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="h-full">
            <Card className="border border-gray-200 bg-white hover:border-purple-300 transition-all duration-300 group h-full">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={item?.image || "/placeholder.svg?height=240&width=320"}
                    alt={item?.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    style={{ aspectRatio: "4/3" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between min-h-[140px]">
                  <h3 className="font-bold text-xl text-gray-800 leading-tight group-hover:text-purple-700 transition-colors duration-200 flex-1">
                    {item?.title}
                  </h3>

                  <Link target="_blank" href={item?.link} className="block">
                    <Button className="w-full py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 border-2 border-purple-200 hover:border-purple-300 transform hover:scale-[1.02] transition-all duration-200">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Shop Now
                      <Zap className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationGrid;
