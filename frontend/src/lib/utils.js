import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getRecommendations = async ({
  boardName,
  pinCount,
  activeTab,
  resetAuthentication,
  country_code,
}) => {
  // This function fetches recommendations from the backend API
  try {
    const params =
      activeTab === "board"
        ? `board=${encodeURIComponent(
            boardName
          )}&countryCode=${encodeURIComponent(country_code)}`
        : `pin_size=${encodeURIComponent(
            pinCount
          )}&countryCode=${encodeURIComponent(country_code)}`;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_RECOMMENDATIONS_URL}?${params}`,
      { credentials: "include" }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch recommendations");
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    if (err?.message == "User not authenticated with Pinterest") {
      resetAuthentication();
    }
    throw err;
  }
};
