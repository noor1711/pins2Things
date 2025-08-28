"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles, Eye, Lock } from "lucide-react";

const ConsentModal = ({ isOpen, onClose, onConsent, boardName }) => {
  const overlayRef = useRef(null);
  const allowRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      allowRef.current?.focus();
    }, 0);
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose?.();
      }}
    >
      <Card className="w-full m-4 max-w-xs lg:max-w-lg md:max-w-md sm:max-w-sm bg-[#f5f1e2] border-2 border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 consent-header text-black">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <h2 id="consent-title" className="text-lg font-semibold">
              Allow access to your Pinterest board?
            </h2>
          </div>
          <p className="text-black/80 text-sm mt-1">
            We’ll analyze your board to create personalized recommendations.
          </p>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="gap-3">
            <h3 className="font-medium text-neutral-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-neutral-800" />
              What we access
            </h3>
            <ul className="text-sm text-neutral-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-800" />
                Read-only access to the selected public board and pins
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-green-700" />
                Analyze images and themes to match your aesthetic
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-800" />
                Use insights to generate recommendations for you
              </li>
            </ul>
          </div>

          <div className="rounded-lg border-2 bg-[#c4d8f3] border-2 border-[#4c90ea] my-5 p-4 text-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 " />
              <span className="text-sm font-semibold">Privacy promise</span>
            </div>
            <p className="text-sm ">
              Your data is used only for this analysis. We do not permanently
              store personal information.
            </p>
          </div>

          <div className="w-full flex flex-1 flex-col md:flex-row lg:flex-row items-center justify-end gap-3">
            <Button
              onClick={onConsent}
              ref={allowRef}
              className="border-2 w-full md:w-2/5 lg:w-2/5 border-black shadow-md text-[#519755] border-b-2 border-[#519755] bg-[#E8F5E9]"
            >
              Allow and Continue
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-2 w-full md:w-2/5 lg:w-2/5 border-neutral-700 text-neutral-800"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
      <style jsx>
        {`
          .consent-header {
            background-color: #b39ddb;
          }
        `}
      </style>
    </div>
  );
};

export default ConsentModal;
