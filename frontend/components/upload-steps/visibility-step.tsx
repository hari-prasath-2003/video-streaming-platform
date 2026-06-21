"use client";

import { Globe, Lock } from "lucide-react";

interface VisibilityStepProps {
  visibility: "public" | "private";
  setVisibility: (value: "public" | "private") => void;
}

export function VisibilityStep({
  visibility,
  setVisibility,
}: VisibilityStepProps) {
  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="space-y-4">
        <button
          onClick={() => setVisibility("public")}
          className={`
            w-full rounded-3xl border p-6 text-left transition-all
            ${
              visibility === "public"
                ? "border-violet-500 bg-violet-500/10"
                : "border-zinc-800 bg-[#111113]"
            }
          `}
        >
          <div className="flex items-center gap-4">
            <Globe className="h-6 w-6" />

            <div>
              <h3 className="font-semibold text-lg">Public</h3>

              <p className="text-zinc-400">Anyone can watch this video</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setVisibility("private")}
          className={`
            w-full rounded-3xl border p-6 text-left transition-all
            ${
              visibility === "private"
                ? "border-violet-500 bg-violet-500/10"
                : "border-zinc-800 bg-[#111113]"
            }
          `}
        >
          <div className="flex items-center gap-4">
            <Lock className="h-6 w-6" />

            <div>
              <h3 className="font-semibold text-lg">Private</h3>

              <p className="text-zinc-400">Only you can access this video</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
