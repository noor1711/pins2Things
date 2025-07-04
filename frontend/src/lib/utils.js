import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getRecommendations = async (url) => {
  if (!url) {
    throw new Error("Pinterest board URL is required");
  }

  const CLOUD_FUNCTION_URL = process.env.NEXT_PUBLIC_CLOUD_FUNCTION_URL;
  if (!!CLOUD_FUNCTION_URL) {
    if (!CLOUD_FUNCTION_URL) {
      throw new Error(
        "Backend API URL is not configured. Check environment variables."
      );
    }

    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ board_url: url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! Status: ${response.status}`
      );
    }

    return response.json();
  }
  // we will just mock a response for now
  return Promise.resolve({
    identified_keywords: ["mocked keyword 1", "mocked keyword 2"],
    generated_search_query: "mocked search query",
    recommendations: [
      {
        title: "Mocked Product 1",
        link: "https://www.example.com/product-1",
        thumbnail: "https://www.example.com/product-1-thumbnail.jpg",
      },
      {
        title: "Mocked Product 2",
        link: "https://www.example.com/product-2",
        thumbnail: "https://www.example.com/product-2-thumbnail.jpg",
      },
    ],
  });
};
