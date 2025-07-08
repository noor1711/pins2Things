"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Sparkles, Star, Palette } from "lucide-react";
import "./globals.css"; // Import global styles
import { getRecommendations } from "@/lib/utils";
import StyledCarousel from "@/components/Carousel";
import { useRouter, useSearchParams } from "next/navigation";

export default function PinterestRecommender() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const router = useRouter(); // Hook to programmatically navigate users
  const searchParams = useSearchParams(); // Hook to read URL query parameters (e.g., after OAuth redirect)

  // useEffect to check the authentication status based on URL parameters (after OAuth callback)
  // and for potential future checks (e.g., local storage token)
  useEffect(() => {
    const status = searchParams.get("status");
    // const message = searchParams.get("message");

    if (status === "success") {
      router.replace(window.location.pathname, undefined, { shallow: true });
    } else if (status === "error") {
      router.replace(window.location.pathname, undefined, { shallow: true });
    } else {
      // In a real-world application, you would also perform an initial check here
      // to see if the user is *already* authenticated (e.g., by checking for a token in
      // localStorage, a cookie, or by making an API call to your backend).
      // For this example, we default to not authenticated unless a success param is present.
      console.log("No authentication status found in URL parameters.");
    }
  }, [searchParams, router]); // Dependencies: re-run this effect if URL query params or router object change

  // Function to initiate the Pinterest OAuth flow by redirecting to your backend
  const handleConnectPinterest = () => {
    // Redirect the user's browser to your Python backend endpoint that starts the Pinterest OAuth flow.
    // IMPORTANT: Ensure your Python backend is running locally on port 8080 (http://localhost:8080)
    // For deployment, this URL would be your deployed backend URL (e.g., https://your-backend.vercel.app/api/pinterest-auth-start)
    router.push("http://localhost:8080/api/pinterest-auth-start");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // This is the URL of your backend endpoint that starts the OAuth flow
      handleConnectPinterest();
      const recommendations = await getRecommendations(url);
      // Handle the recommendations (e.g., display them)
      console.log(recommendations);
      setRecommendations(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <Heart className="absolute top-20 left-10 text-pink-300 w-6 h-6 animate-pulse" />
        <Star className="absolute top-32 right-20 text-yellow-300 w-5 h-5 animate-bounce" />
        <Sparkles className="absolute bottom-40 left-20 text-purple-300 w-7 h-7 animate-pulse" />
        <Heart className="absolute bottom-60 right-10 text-pink-400 w-4 h-4 animate-bounce" />
        <Star className="absolute top-60 left-1/4 text-blue-300 w-6 h-6 animate-pulse" />
        <Sparkles className="absolute top-80 right-1/3 text-pink-300 w-5 h-5 animate-bounce" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Palette className="w-8 h-8 text-pink-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Pins2Things
            </h1>
            <Heart className="w-8 h-8 text-pink-500 animate-pulse" />
          </div>

          <p className="text-gray-600 text-lg font-medium">
            {"Discover your perfect aesthetic vibes! 💕"}
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 px-6 py-3 rounded-full mb-6">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-700 font-semibold">
                    Enter Pinterest Board URL:
                  </span>
                  <Heart className="w-5 h-5 text-pink-500" />
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleFormSubmit(e);
                }}
              >
                <div className="space-y-6">
                  <div className="relative">
                    <Input
                      type="url"
                      placeholder="e.g., https://www.pinterest.com/user/board-name/ 🌸"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-pink-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 bg-white/90 placeholder:text-gray-400 transition-all duration-300"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Heart className="w-5 h-5 text-pink-300" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get Aesthetic Recommendations
                    <Heart className="w-5 h-5 ml-2 animate-pulse" />
                  </Button>
                </div>
              </form>
              {/* Cute decorative elements */}
              <div className="flex justify-center items-center gap-4 mt-8 text-2xl">
                <span>🌸</span>
                <span>✨</span>
                <span>💕</span>
                <span>🦋</span>
                <span>🌙</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <StyledCarousel />
        {/* Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <Heart className="w-4 h-4 text-pink-400" />
            <a
              href="/privacy-policy"
              className="text-purple-600 hover:text-pink-500 font-medium transition-colors duration-300"
            >
              Privacy Policy
            </a>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
        </div>

        {/* Bottom decorative text */}
        <div className="text-center mt-8">
          <p className="text-gray-500 font-medium">
            Made with 💖 for aesthetic lovers everywhere
          </p>
        </div>
      </div>
    </div>
  );
}
