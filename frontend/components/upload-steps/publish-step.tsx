"use client";

import { CheckCircle2 } from "lucide-react";

interface PublishStepProps {
  title: string;
  visibility: string;
  videoFile: File | null;
  thumbnailFile: File | null;
}

export function PublishStep({
  title,
  visibility,
  videoFile,
  thumbnailFile,
}: PublishStepProps) {
  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="rounded-3xl border border-zinc-800 bg-[#111113] p-8">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />

        <h2 className="mt-6 text-center text-3xl font-bold">
          Ready To Publish
        </h2>

        <p className="mt-2 text-center text-zinc-400">
          Review your content before publishing
        </p>

        <div className="mt-10 space-y-6">
          <div>
            <p className="text-sm text-zinc-500">Title</p>
            <p className="mt-1">{title || "Untitled Video"}</p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">Visibility</p>
            <p className="mt-1 capitalize">{visibility}</p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">Video File</p>
            <p className="mt-1">{videoFile?.name ?? "Not Selected"}</p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">Thumbnail</p>
            <p className="mt-1">{thumbnailFile?.name ?? "Not Selected"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
