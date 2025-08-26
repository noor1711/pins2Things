"use client";
import React from "react";
import { Pacifico } from "next/font/google";

// Load the Pacifico font using Next.js font optimization
const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400", // Ensure this weight is available and loaded
});

export const Header = () => {
  return (
    <div
      className={`flex font-bold drop-shadow-5xl text-5xl lg:text-8xl md:text-6xl sm:text-5xl flex-row items-center justify-center text-[#f03a91e8] hover:text-[#fa0279] text-shadow-lg/50 text-shadow-neutral-500 transition-transform duration-200 hover:-translate-y-0.5 ${pacifico.className}`}
    >
      <h1>Pins2Things</h1>
    </div>
  );
};
