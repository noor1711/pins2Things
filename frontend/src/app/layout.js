import {
  Geist,
  Geist_Mono,
  Pixelify_Sans,
  Raleway,
  DynaPuff,
  Sour_Gummy,
} from "next/font/google";
import { Suspense } from "react";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const pixelifySans = Pixelify_Sans({
  variable: "--font-pixelify-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const dynaPuff = DynaPuff({
  variable: "--font-dynapuff",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const sourGummy = Sour_Gummy({
  variable: "--font-sour-gummy",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "Pins2Things",
  description: "From Pins to Products",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/pins2things.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${raleway.variable} ${pixelifySans.variable} ${dynaPuff.variable} ${sourGummy.variable}`}
      >
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
