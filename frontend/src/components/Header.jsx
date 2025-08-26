"use client";
import React from "react";

export const Header = () => {
  return (
    <div className="text-with-image-background flex-row items-center justify-center transition-transform duration-200 hover:-translate-y-0.5 font-sourgummy">
      <h1>Pins2Things</h1>
      <style jsx>
        {`
          .text-with-image-background {
            background-clip: text;
            color: transparent;
            font-weight: 800;
            font-size: 6em;
            background-image: linear-gradient(
              45deg,
              #00a36c,
              #5fbc8b,
              #a2d5ab,
              #00a36c
            );
          }
        `}
      </style>
    </div>
  );
};
