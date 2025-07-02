// frontend/src/components/PinterestForm.jsx
"use client"; // This directive is crucial for App Router components that use client-side hooks like useState, useEffect

import React, { useState } from "react";
import styles from "../styles/PinterestForm.module.css"; // Import CSS Modules for component-specific styles

function PinterestForm() {
  const [pinterestUrl, setPinterestUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  // Get the Cloud Function URL from environment variables
  const CLOUD_FUNCTION_URL = process.env.NEXT_PUBLIC_CLOUD_FUNCTION_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pinterestUrl) {
      setError("Please enter a Pinterest board URL.");
      return;
    }

    if (!CLOUD_FUNCTION_URL) {
      setError(
        "Backend API URL is not configured. Check environment variables."
      );
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const response = await fetch(CLOUD_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ board_url: pinterestUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }

      const data = await response.json();
      setRecommendations(data);
      console.log("Recommendations:", data);
    } catch (err) {
      console.error("API call failed:", err);
      setError(`Failed to fetch recommendations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pinterestFormContainer}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="pinterest-url-input">Enter Pinterest Board URL:</label>
        <input
          id="pinterest-url-input"
          type="url"
          value={pinterestUrl}
          onChange={(e) => setPinterestUrl(e.target.value)}
          placeholder="e.g., https://www.pinterest.com/user/board-name/"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Get Aesthetic Recommendations"}
        </button>
      </form>

      {loading && (
        <p className={styles.statusMessage}>Generating recommendations...</p>
      )}
      {error && <p className={styles.errorMessage}>Error: {error}</p>}

      {recommendations && (
        <div className={styles.resultsContainer}>
          {recommendations.identified_keywords.length > 0 && (
            <p>
              <strong>Identified Keywords:</strong>{" "}
              {recommendations.identified_keywords.join(", ")}
            </p>
          )}
          {recommendations.generated_search_query && (
            <p>
              <strong>Generated Search Query:</strong> "
              {recommendations.generated_search_query}"
            </p>
          )}

          {recommendations.recommendations &&
          recommendations.recommendations.length > 0 ? (
            <div className={styles.recommendationsGrid}>
              <h2>Product Recommendations:</h2>
              {recommendations.recommendations.map((rec, index) => (
                <div key={index} className={styles.recommendationCard}>
                  {rec.thumbnail && (
                    <img
                      src={rec.thumbnail}
                      alt={rec.title || "Product Image"}
                    />
                  )}
                  <h3>
                    <a
                      href={rec.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {rec.title}
                    </a>
                  </h3>
                </div>
              ))}
            </div>
          ) : (
            recommendations.generated_search_query && (
              <p>No specific product recommendations found for this query.</p>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default PinterestForm;
