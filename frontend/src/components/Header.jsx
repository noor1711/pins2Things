"use client";
import React from "react";

export const Header = () => {
  return (
    <div className="flex flex-row items-center justify-center text-[#f03a91e8] hover:text-[#fa0279] transition-transform duration-200 hover:-translate-y-0.5 font-sourgummy">
      <h1 className="text-8xl font-bold drop-shadow-5xl">Pins</h1>
      <h1 className="text-9xl font-bold drop-shadow-5xl">2</h1>
      <h1 className="text-8xl font-bold drop-shadow-5xl">Things</h1>
    </div>
  );
};
