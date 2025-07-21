"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Zap, Eye, Sparkles, Star, Palette } from "lucide-react";
import "./globals.css"; // Import global styles
import { getRecommendations } from "@/lib/utils";
import StyledCarousel from "@/components/Carousel";
import ErrorMessage from "@/components/ErrorMessage";

const recommendationToCardItemMapper = (recommendations) => {
  return recommendations?.recommendations?.map((item, index) => ({
    id: index,
    title: item.title,
    image: item.thumbnail || "/placeholder.svg?height=200&width=200", // Fallback image
    link: item.link || "#", // Fallback link
  }));
};

export default function PinterestRecommender() {
  const [boardName, setBoardName] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const recommendations = await getRecommendations(boardName); // Replace with actual board
      setRecommendations(recommendationToCardItemMapper(recommendations));
      console.log("Fetched recommendations:", recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError(error.message || "Failed to fetch recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // This is the URL of your backend endpoint that starts the OAuth flow
      fetchRecommendations(); // Simulate successful connection for demo purposes
    } catch (error) {
      console.error("Error doing Oauth connection", error);
      setError(error.message || "Failed to connect to Pinterest");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-purple-50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute top-60 right-32 w-24 h-24 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-1/3 w-28 h-28 bg-pink-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <ErrorMessage error={error} onDismiss={() => setError(null)} />
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Palette className="w-10 h-10 text-purple-600" />
              <Sparkles className="w-4 h-4 text-pink-500 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Pinterest Aesthetic
            </h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            Recommender
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Transform your Pinterest boards into personalized aesthetic
            insights.
            <span className="text-purple-600 font-medium">
              {" "}
              Discover your unique visual style
            </span>{" "}
            with AI-powered analysis.
          </p>
        </div>

        {/* Main Search Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-8 md:p-12">
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-full mb-4">
                  <Search className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700 font-semibold">
                    Enter the name of Pinterest Board
                  </span>
                </div>
                <p className="text-gray-500">
                  Enter any Pinterest board and let our AI analyze your
                  aesthetic preferences
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleFormSubmit(e);
                }}
              >
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 group-focus-within:text-purple-600">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Enter Pinterest board name"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    className="w-full pl-12 pr-4 py-5 text-base border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 bg-white/90 transition-all duration-200 placeholder:text-gray-400"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    type="submit"
                    className="w-full py-5 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                    disabled={!boardName?.trim()}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Analyze My Aesthetic
                    <Sparkles className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        <StyledCarousel items={recommendations} />
        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-3">
              Visual Intelligence
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Advanced AI analyzes colors, patterns, and visual themes to
              understand your unique aesthetic DNA
            </p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
              <Sparkles className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-3">
              Curated Magic
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Get personalized recommendations that perfectly match your style
              preferences and creative vision
            </p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-3">
              Instant Insights
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Discover your aesthetic profile in seconds with real-time analysis
              and beautiful visualizations
            </p>
          </div>
        </div>

        {/* Creative Quote */}
        <div className="mt-20 text-center">
          <blockquote className="text-xl md:text-2xl font-medium text-gray-700 italic">
            Every Pinterest board tells a story about who you are.
          </blockquote>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-8 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"></div>
            <Palette className="w-5 h-5 text-purple-500" />
            <div className="w-8 h-0.5 bg-gradient-to-r from-pink-400 to-blue-400"></div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <a
            href="/privacy-policy"
            className="text-purple-600 hover:text-pink-600 font-medium transition-colors duration-200"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
