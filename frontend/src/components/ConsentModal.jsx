"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Shield, Eye, Lock, Sparkles } from "lucide-react";

const ConsentModal = ({ isOpen, onClose, onConsent, boardName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-0 shadow-2xl">
        <CardContent className="p-0">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-t-lg">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">
                Pinterest Access Request
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              We need your permission to analyze your Pinterest board
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-purple-800">
                  Board to Analyze:
                </span>
              </div>
              <p className="text-purple-700 font-medium">{boardName}</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-600" />
                What we'll access:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Read your public Pinterest boards and pins</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Analyze images and themes from your selected board
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Generate personalized product recommendations</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-800">
                  Privacy Promise:
                </span>
              </div>
              <p className="text-green-700 text-sm">
                We only access the specific board you choose and never store
                your personal data permanently.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={onConsent}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Allow Access
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsentModal;
