"use client";

import { Check } from "lucide-react";

interface UploadSidebarProps {
  currentStep: number;
  steps: string[];
  onStepChange: (step: number) => void;
}

export function UploadSidebar({
  currentStep,
  steps,
  onStepChange,
}: UploadSidebarProps) {
  return (
    <aside className="w-64 shrink-0 border-r border-zinc-800 bg-[#111113] p-6">
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white">VidForge Studio</h2>

        <p className="mt-1 text-sm text-zinc-500">Upload & publish content</p>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const active = currentStep === index;
          const completed = currentStep > index;

          return (
            <button
              key={step}
              onClick={() => onStepChange(index)}
              className={`
                flex w-full items-center gap-4 rounded-2xl px-4 py-4 transition-all
                ${
                  active
                    ? "bg-violet-600 text-white"
                    : "text-zinc-400 hover:bg-zinc-800"
                }
              `}
            >
              <div
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold
                  ${
                    active
                      ? "bg-white text-black"
                      : completed
                        ? "bg-green-500 text-white"
                        : "bg-zinc-700"
                  }
                `}
              >
                {completed ? <Check size={14} /> : index + 1}
              </div>

              <span>{step}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
