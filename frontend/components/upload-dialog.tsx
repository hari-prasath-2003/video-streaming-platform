"use client";

import { useEffect, useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { UploadSidebar } from "@/components/upload-sidebar";

import { MetadataStep } from "@/components/upload-steps/metadata-step";
import { AssetsStep } from "@/components/upload-steps/assets-step";
import { VisibilityStep } from "@/components/upload-steps/visibility-step";
import { PublishStep } from "@/components/upload-steps/publish-step";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = ["Metadata", "Assets", "Access Control", "Publish"];

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const [step, setStep] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [visibility, setVisibility] = useState<"public" | "private">("public");

  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!videoFile) {
      setVideoPreview(null);
      return;
    }

    const url = URL.createObjectURL(videoFile);

    setVideoPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoFile]);

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview(null);
      return;
    }

    const url = URL.createObjectURL(thumbnailFile);

    setThumbnailPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [thumbnailFile]);

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const closeDialog = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          h-[92vh]
          sm:max-w-[1400px]
          overflow-y-auto
          border
          border-zinc-800
          bg-[#0a0a0b]
          p-0
          text-white
        "
      >
        <div className="flex h-full">
          <UploadSidebar
            currentStep={step}
            steps={steps}
            onStepChange={setStep}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="border-b border-zinc-800 px-8 py-6">
              <h1 className="text-2xl font-semibold">{steps[step]}</h1>

              <p className="mt-1 text-sm text-zinc-500">
                Configure your video before publishing
              </p>
            </div>

            <div className="min-w-0 flex-1 overflow-y-auto">
              {step === 0 && (
                <MetadataStep
                  title={title}
                  description={description}
                  videoFile={videoFile}
                  videoPreview={videoPreview}
                  setTitle={setTitle}
                  setDescription={setDescription}
                  setVideoFile={setVideoFile}
                />
              )}

              {step === 1 && (
                <AssetsStep
                  thumbnailFile={thumbnailFile}
                  thumbnailPreview={thumbnailPreview}
                  setThumbnailFile={setThumbnailFile}
                />
              )}

              {step === 2 && (
                <VisibilityStep
                  visibility={visibility}
                  setVisibility={setVisibility}
                />
              )}

              {step === 3 && (
                <PublishStep
                  title={title}
                  visibility={visibility}
                  videoFile={videoFile}
                  thumbnailFile={thumbnailFile}
                />
              )}
            </div>

            <div className="flex items-center justify-between border-t border-zinc-800 bg-[#111113] px-8 py-5">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 0}
                className="
                  border-zinc-700
                  bg-transparent
                  hover:bg-zinc-800
                "
              >
                Back
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={closeDialog}
                  className="text-zinc-400"
                >
                  Cancel
                </Button>

                {step < steps.length - 1 ? (
                  <Button
                    onClick={nextStep}
                    className="
                      bg-violet-600
                      hover:bg-violet-500
                    "
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    className="
                      bg-violet-600
                      hover:bg-violet-500
                    "
                  >
                    Publish Video
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
