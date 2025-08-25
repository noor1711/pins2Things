"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Zap, Eye, Sparkles, Palette, Heart } from "lucide-react";
import "./globals.css"; // Import global styles
import { getRecommendations } from "@/lib/utils";
import ErrorMessage from "@/components/ErrorMessage";
import SkeletonGrid from "@/components/SkeletonGrid";
import RecommendationGrid from "@/components/RecommendationsGrid";
import { useAuth } from "@/context/AuthContext";
import ConsentModal from "@/components/ConsentModal";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import Image from "next/image";

const recommendationToCardItemMapper = (recommendations) => {
  return recommendations?.recommendations?.map((item, index) => ({
    id: index,
    title: item.title,
    image: item.thumbnail || "/placeholder.svg?height=200&width=200",
    link: item.link || "#",
  }));
};

export default function PinterestRecommender() {
  const [activeTab, setActiveTab] = useState("board"); // "board" or "pins"
  const [boardName, setBoardName] = useState("");
  const [pinCount, setPinCount] = useState("5");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const { isAuthenticated, authenticateUser } = useAuth();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const board = searchParams.get("board");
    if (!!board) {
      setBoardName(board);
    }
  }, [searchParams]);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const recommendations = await getRecommendations({
        boardName,
        pinCount,
        activeTab,
      });
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
    if (activeTab === "board" && !boardName.trim()) {
      setError("Please enter a Pinterest board name");
      return;
    }

    try {
      // This is the URL of your backend endpoint that starts the OAuth flow
      if (!isAuthenticated) {
        setShowConsentModal(true);
      } else {
        fetchRecommendations(); // Simulate successful connection for demo purposes
      }
    } catch (error) {
      console.error("Error doing Oauth connection", error);
      setError(error.message || "Failed to connect to Pinterest");
    }
  };

  const handleConsent = async () => {
    setShowConsentModal(false);
    setError(null);
    try {
      await authenticateUser(boardName);
    } catch (error) {
      console.error("Error in consent flow:", error);
      setError(error.message || "Failed to connect to Pinterest");
    }
  };

  const handleConsentClose = () => {
    setShowConsentModal(false);
  };

  return (
    <div className="min-h-screen relative bg-[#fdf6df] text-white">
      {/* <div className="fixed inset-0 pointer-events-none z-0">
        <Image
          src="/bowPix.png"
          alt="Pixel Bow"
          width={60}
          height={40}
          priority
          className="absolute top-25 left-1/5 opacity-90 w-12 h-8 sm:w-16 sm:h-10"
        />
        <Image
          src="/bowIcecream.png"
          alt="Pixel Flower"
          width={60}
          height={40}
          priority
          className="absolute top-60 sm:top-80 right-2 sm:right-10 opacity-40 w-12 h-8 sm:w-16 sm:h-10"
        />
      </div> */}
      <div className="text-[#ff5fac] text-2xl flex flex-row justify-end font-sourgummy p-2 items-center">
        For the Girlies. <Heart />
      </div>
      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <ErrorMessage error={error} onDismiss={() => setError(null)} />
        <header className="mb-10 text-center">
          <Header />
          <p className="text-neutral-900 mt-3">
            Paste a board name and we&apos;ll find products that match your
            vibe.
          </p>
        </header>

        <Card className="border-3 border-neutral-800 overflow-hidden ">
          {/* Tab Navigation */}
          <div className="flex border-b border-neutral-800">
            <button
              onClick={() => setActiveTab("board")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === "board"
                  ? "text-[#519755] border-b-2 border-[#519755] bg-[#fffbec]"
                  : "text-gray-500 hover:text-gray-700 bg-[#d0d0a8]"
              }`}
              disabled={isLoading}
            >
              Analyze Board
            </button>
            <button
              onClick={() => setActiveTab("pins")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === "pins"
                  ? "text-[#519755] border-b-2 border-[#519755] bg-[#fffbec]"
                  : "text-gray-500 hover:text-gray-700 bg-[#d0d0a8]"
              }`}
              disabled={isLoading}
            >
              Analyze Recent Pins
            </button>
          </div>

          <CardContent className="p-6 md:p-8 bg-[#fffbec]">
            <form onSubmit={handleFormSubmit} noValidate>
              {/* Board Tab Content */}
              {activeTab === "board" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="board"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Pinterest Board Name
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <Input
                        id="board"
                        type="text"
                        placeholder="Enter Pinterest board name"
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        className="pl-9 h-10 text-neutral-900 placeholder-neutral-500 border-neutral-800 focus:border-green-800 focus-visible:ring-green-800/30 focus-visible:ring-4"
                        aria-invalid={!!error}
                        aria-describedby={error ? "board-error" : undefined}
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isLoading ? (
                          <span className="w-4 h-4 inline-block border-2 border-[#519755]/80 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#A8DCAB] to-[#BE91BE] animate-pulse" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      We will analyze all pins from this specific board to
                      understand your aesthetic.
                    </p>
                  </div>
                </div>
              )}

              {/* Pins Tab Content */}
              {activeTab === "pins" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="pinCount"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Number of Recent Pins to Analyze
                    </label>
                    <select
                      id="pinCount"
                      value={pinCount}
                      onChange={(e) => setPinCount(e.target.value)}
                      className="w-full px-3 py-2 h-10 bg-[#fffbec] text-gray-900 border border-neutral-800 rounded-md focus:border-[#519755] focus:ring-[#519755]/30 focus:ring-4 focus:outline-none disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <option value="5">5 pins</option>
                      <option value="10">10 pins</option>
                      <option value="25">25 pins</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      We will analyze your most recent pins across all boards to
                      understand your current aesthetic preferences.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full text-white border-2 border-black bg-green-700 hover:bg-green-600 shadow-md py-3 mt-6"
                disabled={
                  (activeTab === "board" && !boardName.trim()) || isLoading
                }
              >
                {isLoading
                  ? "Analyzing…"
                  : activeTab === "board"
                  ? "Analyze Board"
                  : "Analyze Recent Pins"}
              </Button>

              <div className="mt-4 min-h-[1.25rem]">
                {error ? (
                  <p id="board-error" className="text-sm text-red-600">
                    {error}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    {activeTab === "board"
                      ? "We'll ask permission before accessing your board."
                      : "We'll ask permission before accessing your recent pins."}
                  </p>
                )}
              </div>
              <div className="sr-only" aria-live="polite">
                {isLoading
                  ? "Loading recommendations…"
                  : recommendations
                  ? "Recommendations ready."
                  : ""}
              </div>
            </form>
          </CardContent>
        </Card>

        <section className="mt-8">
          {isLoading ? (
            <SkeletonGrid message="Discovering products that match your aesthetic…" />
          ) : recommendations ? (
            <RecommendationGrid items={recommendations} />
          ) : null}
        </section>

        <footer className="mt-12 pt-6 border-t border-neutral-800 text-center">
          <a
            href="/privacy-policy"
            className="text-md text-pink-400 hover:text-pink-500 underline underline-offset-4"
          >
            Privacy policy
          </a>
        </footer>
      </div>

      <ConsentModal
        isOpen={showConsentModal}
        onClose={handleConsentClose}
        onConsent={handleConsent}
        boardName={boardName}
      />
    </div>
  );
}
