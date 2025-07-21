import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getRecommendations = async (input) => {
  // This function fetches recommendations from the backend API
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_RECOMMENDATIONS_URL
      }?board_url=${encodeURIComponent(input)}`,
      { credentials: "include" }
    );

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    throw err;
  }
};
