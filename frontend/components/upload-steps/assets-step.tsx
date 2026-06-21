"use client";

import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssetsStepProps {
  thumbnailFile: File | null;
  thumbnailPreview: string | null;
  setThumbnailFile: (file: File | null) => void;
}

export function AssetsStep({
  thumbnailFile,
  thumbnailPreview,
  setThumbnailFile,
}: AssetsStepProps) {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="rounded-3xl border border-zinc-800 bg-[#111113] p-8">
        <div className="text-center">
          <ImageIcon className="mx-auto h-16 w-16 text-violet-400" />

          <h2 className="mt-4 text-2xl font-semibold">Thumbnail</h2>

          <p className="mt-2 text-zinc-400">
            Upload a custom thumbnail for your video
          </p>

          <input
            hidden
            id="thumbnail-upload"
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
          />

          <Button
            className="mt-6 bg-violet-600 hover:bg-violet-500"
            onClick={() => document.getElementById("thumbnail-upload")?.click()}
          >
            Select Thumbnail
          </Button>

          {thumbnailPreview && (
            <img
              src={thumbnailPreview}
              alt="Thumbnail Preview"
              className="mt-8 w-full rounded-2xl border border-zinc-800"
            />
          )}

          {!thumbnailPreview && (
            <div className="mt-8 flex aspect-video items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900">
              <p className="text-zinc-500">Thumbnail Preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
