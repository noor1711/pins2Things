// frontend/src/components/PinterestForm.jsx
"use client"; // This directive is crucial for App Router components that use client-side hooks like useState, useEffect

import React, { useState } from "react";
import styles from "../styles/PinterestForm.module.css"; // Import CSS Modules for component-specific styles

const Recommendations = ({ recommendations }) => {
  return (
    <div className={styles.pinterestFormContainer}>
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
};

export default Recommendations;
