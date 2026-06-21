"use client";

import { Upload, FileVideo } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface MetadataStepProps {
  title: string;
  description: string;
  videoFile: File | null;
  videoPreview: string | null;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setVideoFile: (file: File | null) => void;
}

export function MetadataStep({
  title,
  description,
  videoFile,
  videoPreview,
  setTitle,
  setDescription,
  setVideoFile,
}: MetadataStepProps) {
  return (
    <div className="flex gap-8 p-8">
      <div className="min-w-0 flex-1 space-y-6">
        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Video Title
          </label>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Building a Distributed Streaming Platform"
            className="h-12 border-zinc-700 bg-zinc-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Description
          </label>

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your video..."
            className="min-h-[220px] border-zinc-700 bg-zinc-900"
          />
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-12 text-center transition-all hover:border-violet-500/40">
          <Upload className="mx-auto h-14 w-14 text-violet-400" />

          <h3 className="mt-4 text-xl font-semibold">Upload Video</h3>

          <p className="mt-2 text-zinc-400">Drag & drop or select a file</p>

          <input
            id="video-upload"
            hidden
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          />

          <Button
            className="mt-6 bg-violet-600 hover:bg-violet-500"
            onClick={() => document.getElementById("video-upload")?.click()}
          >
            Select Video
          </Button>
        </div>
      </div>

      <div className="w-[380px] shrink-0">
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-[#111113] shadow-2xl">
          {videoPreview ? (
            <video
              controls
              src={videoPreview}
              className="aspect-video w-full"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center bg-zinc-800">
              <FileVideo className="h-14 w-14 text-zinc-500" />
            </div>
          )}

          <div className="p-5">
            <h3 className="font-semibold">Video Preview</h3>

            <p className="mt-2 truncate text-sm text-zinc-400">
              {videoFile?.name ?? "No video selected"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
