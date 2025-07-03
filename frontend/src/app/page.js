import React from "react";
import PinterestForm from "@/components/PinterestForm";
import "../styles/global.css"; // Your global CSS file
import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      {" "}
      {/* Use a container class for general layout */}
      <header className="header">
        <h1>Pinterest Aesthetic Recommender</h1>
      </header>
      <main>
        <PinterestForm />
      </main>
      <footer className="footer">
        <Link href="/privacy-policy">Privacy Policy</Link>
      </footer>
    </div>
  );
}
