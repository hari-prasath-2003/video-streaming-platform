"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Play, Shuffle, Clock3, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import UseApi from "@/hooks/UseApi";
import {
  mediaUrl,
  formatViews,
  formatDuration,
  type Video,
} from "@/lib/video";

export default function LikedPage() {
  const { get, accessToken } = UseApi();
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    get("/api/video/liked").then((res) => setVideos(res.data));
  }, []);

  return (
    <div className="w-full px-8 py-8">
      {/* Hero */}
      <Card className="overflow-hidden border-zinc-800 bg-gradient-to-r from-pink-950/50 via-zinc-950 to-zinc-950">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-pink-500/15">
              <Heart className="h-12 w-12 fill-pink-500 text-pink-500" />
            </div>

            <div>
              <p className="text-sm uppercase tracking-wider text-zinc-400">
                Collection
              </p>

              <h1 className="mt-2 text-4xl font-bold">Liked Videos</h1>

              <p className="mt-2 text-zinc-400">
                Videos you've saved by liking
              </p>

              <div className="mt-4 flex items-center gap-3 text-sm text-zinc-500">
                <span>{videos.length} videos</span>
                <span>•</span>
                <span>Updated automatically</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button>
          <Play className="mr-2 h-4 w-4 fill-current" />
          Play All
        </Button>

        <Button variant="secondary">
          <Shuffle className="mr-2 h-4 w-4" />
          Shuffle
        </Button>

        <Button variant="outline" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Videos */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Your Likes</h2>

        <div className="space-y-3">
          {videos.map((video, index) => (
            <Link key={video.id} href={`/watch/${video.id}`}>
              <Card className="group border-zinc-800 bg-zinc-950/40 transition-all hover:border-pink-500/30">
                <CardContent className="p-3">
                  <div className="flex items-center gap-4">
                    {/* Index */}
                    <div className="w-8 text-center text-sm text-zinc-500">
                      {index + 1}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-56 shrink-0 overflow-hidden rounded-xl">
                      <img
                        src={
                          mediaUrl(video.thumbnailUrl, accessToken) ||
                          `https://picsum.photos/600/340?random=${video.id}`
                        }
                        alt={video.title}
                        className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs">
                        {formatDuration(video.durationSeconds)}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-base font-semibold">
                        {video.title}
                      </h3>

                      <p className="mt-2 text-sm text-zinc-400">
                        {video.channelId.slice(0, 8)}
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                        <span>{formatViews(video.viewCount)}</span>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="hidden items-center gap-2 text-sm text-zinc-400 lg:flex">
                      <Clock3 className="h-4 w-4" />
                      {formatDuration(video.durationSeconds)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
