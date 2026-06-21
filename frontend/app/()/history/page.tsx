"use client";

import { useEffect, useState } from "react";
import { History, Play, Trash2, Clock3, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type HistoryVideo = {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  views: string;
  watchedAt: string;
  duration: string;
  progress: number;
};

export default function HistoryPage() {
  const [videos, setVideos] = useState<HistoryVideo[]>([]);

  useEffect(() => {
    setVideos([
      {
        id: "1",
        title: "Building a Distributed Streaming Platform",
        channel: "StreamStack",
        views: "120K views",
        watchedAt: "10 minutes ago",
        duration: "18:42",
        progress: 72,
        thumbnail: "https://picsum.photos/600/340?random=1",
      },
      {
        id: "2",
        title: "Next.js 15 Complete Guide",
        channel: "CodeVerse",
        views: "89K views",
        watchedAt: "Yesterday",
        duration: "24:18",
        progress: 100,
        thumbnail: "https://picsum.photos/600/340?random=2",
      },
      {
        id: "3",
        title: "System Design Interview Preparation",
        channel: "AlgoVision",
        views: "310K views",
        watchedAt: "2 days ago",
        duration: "36:51",
        progress: 35,
        thumbnail: "https://picsum.photos/600/340?random=3",
      },
    ]);
  }, []);

  return (
    <div className="w-full px-8 py-8">
      {/* Hero */}
      <Card className="overflow-hidden border-zinc-800 bg-gradient-to-r from-amber-950/50 via-zinc-950 to-zinc-950">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-500/10">
              <History className="h-12 w-12 text-amber-400" />
            </div>

            <div>
              <p className="text-sm uppercase tracking-wider text-zinc-400">
                Watch Activity
              </p>

              <h1 className="mt-2 text-4xl font-bold">Watch History</h1>

              <p className="mt-2 text-zinc-400">
                Videos you've recently watched
              </p>

              <div className="mt-4 flex items-center gap-3 text-sm text-zinc-500">
                <span>{videos.length} videos</span>
                <span>•</span>
                <span>Automatically tracked</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button>
          <Play className="mr-2 h-4 w-4 fill-current" />
          Continue Watching
        </Button>

        <Button variant="outline">
          <Trash2 className="mr-2 h-4 w-4" />
          Clear History
        </Button>
      </div>

      {/* Videos */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Recently Watched</h2>

        <div className="space-y-3">
          {videos.map((video, index) => (
            <Card
              key={video.id}
              className="group border-zinc-800 bg-zinc-950/40 transition-all hover:border-amber-500/30"
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-4">
                  {/* Number */}
                  <div className="w-8 text-center text-sm text-zinc-500">
                    {index + 1}
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-56 shrink-0 overflow-hidden rounded-xl">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="aspect-video w-full object-cover"
                    />

                    <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs">
                      {video.duration}
                    </div>

                    {/* Watch Progress */}
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-black/50">
                      <div
                        className="h-full bg-red-500"
                        style={{
                          width: `${video.progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-base font-semibold">
                      {video.title}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-400">
                      {video.channel}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                      <span>{video.views}</span>
                      <span>•</span>

                      <Clock3 className="h-3 w-3" />

                      <span>{video.watchedAt}</span>
                    </div>

                    <div className="mt-3 text-xs text-amber-400">
                      {video.progress}% watched
                    </div>
                  </div>

                  {/* Status */}
                  <div className="hidden lg:block">
                    {video.progress === 100 ? (
                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                        Completed
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
                        In Progress
                      </span>
                    )}
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="hidden lg:flex"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
