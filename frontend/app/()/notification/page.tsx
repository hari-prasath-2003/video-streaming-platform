"use client";

import { useEffect, useState } from "react";
import { Bell, Clock3, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type VideoNotification = {
  id: string;
  title: string;
  channel: string;
  views: string;
  time: string;
  duration: string;
  thumbnail: string;
};

export default function NotificationsPage() {
  const [videos, setVideos] = useState<VideoNotification[]>([]);

  useEffect(() => {
    setVideos([
      {
        id: "video-1",
        title: "Building a Distributed Streaming Platform from Scratch",
        channel: "StreamStack",
        views: "120K views",
        time: "2 minutes ago",
        duration: "18:42",
        thumbnail: "https://picsum.photos/600/340?random=1",
      },
      {
        id: "video-2",
        title: "Next.js 15 App Router Deep Dive",
        channel: "CodeVerse",
        views: "89K views",
        time: "1 hour ago",
        duration: "24:17",
        thumbnail: "https://picsum.photos/600/340?random=2",
      },
      {
        id: "video-3",
        title: "How YouTube Recommendation System Works",
        channel: "AlgoVision",
        views: "310K views",
        time: "Yesterday",
        duration: "31:08",
        thumbnail: "https://picsum.photos/600/340?random=3",
      },
      {
        id: "video-4",
        title: "Scaling PostgreSQL for Millions of Users",
        channel: "Backend Daily",
        views: "540K views",
        time: "Yesterday",
        duration: "42:51",
        thumbnail: "https://picsum.photos/600/340?random=4",
      },
    ]);
  }, []);

  return (
    <div className="w-full px-8 py-8">
      {/* Hero */}
      <Card className="overflow-hidden border-zinc-800 bg-zinc-950/50">
        <CardContent className="p-0">
          <div className="relative h-72">
            <img
              src="https://picsum.photos/1600/600?blur=1"
              alt="Notifications"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

            <div className="absolute bottom-0 left-0 p-8">
              <div className="mb-3 flex items-center gap-2 text-violet-300">
                <Bell className="h-5 w-5" />
                Notifications
              </div>

              <h1 className="text-4xl font-bold">New Videos</h1>

              <p className="mt-2 max-w-2xl text-zinc-400">
                Latest uploads from channels you follow.
              </p>

              <div className="mt-4 flex gap-4 text-sm text-zinc-400">
                <span>{videos.length} new uploads</span>
                <span>•</span>
                <span>Updated recently</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-3">
        <Button>
          <PlayCircle className="mr-2 h-4 w-4" />
          Watch Latest
        </Button>

        <Button variant="outline">Mark All Seen</Button>
      </div>

      {/* Feed */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Recent Uploads</h2>

        <div className="space-y-3">
          {videos.map((video, index) => (
            <Card
              key={video.id}
              className="group border-zinc-800 bg-zinc-950/40 transition-all hover:border-violet-500/40"
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
                      className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Duration */}
                    <div className="absolute bottom-2 right-2 rounded bg-black/85 px-2 py-1 text-xs font-medium text-white">
                      {video.duration}
                    </div>
                  </div>

                  {/* Content */}
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

                      <span>{video.time}</span>
                    </div>
                  </div>

                  {/* New Badge */}
                  <div className="hidden lg:flex">
                    <div className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-300">
                      New
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
