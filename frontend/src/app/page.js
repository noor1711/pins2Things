"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Zap, Eye, Sparkles, Palette } from "lucide-react";
import "./globals.css"; // Import global styles
import { getRecommendations } from "@/lib/utils";
import ErrorMessage from "@/components/ErrorMessage";
import SkeletonGrid from "@/components/SkeletonGrid";
import RecommendationGrid from "@/components/RecommendationsGrid";
import { useAuth } from "@/context/AuthContext";
import ConsentModal from "@/components/ConsentModal";
import { useSearchParams } from "next/navigation";

const recommendationToCardItemMapper = (recommendations) => {
  return recommendations?.recommendations?.map((item, index) => ({
    id: index,
    title: item.title,
    image: item.thumbnail || "/placeholder.svg?height=200&width=200",
    link: item.link || "#",
  }));
};

export default function PinterestRecommender() {
  const [boardName, setBoardName] = useState();
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

    if (!boardName?.trim()) {
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
    <div className="min-h-screen relative bg-black text-white">
      {/* Neon ambient glows */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
        <div className="absolute -top-10 -left-10 w-60 h-60 bg-emerald-500 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-52 h-52 bg-lime-400 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-56 h-56 bg-amber-400 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <ErrorMessage error={error} onDismiss={() => setError(null)} />
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-neutral-900 border border-neutral-800 text-neutral-300 mb-3">
            <Sparkles className="w-4 h-4 text-lime-400" />
            <span className="text-xs font-medium">Aesthetic matcher</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-500 via-lime-400 to-amber-400 bg-clip-text text-transparent">
            Pinterest Aesthetic Recommender
          </h1>
          <p className="text-neutral-300 mt-3">
            Paste a board name and we&apos;ll find products that match your
            vibe.
          </p>
        </header>

        <Card className="border border-neutral-800 bg-neutral-950 rounded-2xl">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleFormSubmit} noValidate>
              <label htmlFor="board" className="sr-only">
                Pinterest board name
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                    <Search className="w-4 h-4" />
                  </div>
                  <Input
                    id="board"
                    type="text"
                    placeholder="Enter Pinterest board name"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    className="pl-9 bg-neutral-950 text-neutral-100 placeholder-neutral-500 border-neutral-800 focus:border-emerald-400 focus-visible:ring-emerald-500/30 focus-visible:ring-4"
                    aria-invalid={!!error}
                    aria-describedby={error ? "board-error" : undefined}
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isLoading ? (
                      <span className="w-4 h-4 inline-block border-2 border-emerald-400/80 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 animate-pulse" />
                    )}
                  </div>
                </div>
                <Button
                  type="submit"
                  className="text-black bg-gradient-to-r from-emerald-500 via-lime-400 to-amber-400 hover:from-emerald-400 hover:via-lime-300 hover:to-amber-300"
                  disabled={!boardName?.trim() || isLoading}
                >
                  {isLoading ? "Analyzing…" : "Analyze"}
                </Button>
              </div>
              <div className="mt-2 min-h-[1.25rem]">
                {error ? (
                  <p id="board-error" className="text-sm text-amber-300">
                    {error}
                  </p>
                ) : (
                  <p className="text-xs text-neutral-400">
                    We’ll ask permission before accessing your board.
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
            className="text-sm text-neutral-400 hover:text-neutral-200 underline underline-offset-4"
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
