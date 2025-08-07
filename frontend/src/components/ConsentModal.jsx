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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose?.();
      }}
    >
      <Card className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Neon header */}
        <div className="p-5 bg-gradient-to-r from-emerald-500 via-lime-400 to-amber-400 text-black">
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
          {/* Board capsule */}
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-neutral-900 border border-neutral-800 text-neutral-200">
            <Sparkles className="w-4 h-4 text-lime-400" />
            <span className="text-sm">
              Board:{" "}
              <span className="font-medium text-white">
                {boardName || "Selected board"}
              </span>
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" /> What we access
            </h3>
            <ul className="text-sm text-neutral-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Read-only access to the selected public board and pins
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-lime-400" />
                Analyze images and themes to match your aesthetic
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-400" />
                Use insights to generate recommendations for you
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-emerald-700 bg-emerald-900/20 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-white">
                Privacy promise
              </span>
            </div>
            <p className="text-sm text-neutral-300">
              Your data is used only for this analysis. We do not permanently
              store personal information.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="min-w-[96px] border-neutral-700 text-neutral-200"
            >
              Cancel
            </Button>
            <Button
              onClick={onConsent}
              ref={allowRef}
              className="min-w-[160px] text-black bg-gradient-to-r from-emerald-500 via-lime-400 to-amber-400 hover:from-emerald-400 hover:via-lime-300 hover:to-amber-300"
            >
              Allow and continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsentModal;
