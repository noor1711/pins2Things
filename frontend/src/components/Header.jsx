"use client";
import React from "react";

export const Header = () => {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="720"
        height="150"
        viewBox="0 0 720 150"
      >
        <text x="450" y="100" className="colorText">
          pins2Things
        </text>
      </svg>
      <style jsx>
        {`
          .colorText {
            stroke-width: 6px;
            paint-order: stroke;
          }
          text {
            font: 100px bold sans-serif;
            font-weight: 900;
            stroke-linejoin: round;
            text-anchor: middle;
            fill: #f97316;
            stroke: black;
          }
        `}
      </style>
    </>
  );
};
