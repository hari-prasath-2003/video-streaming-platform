"use client";

import { Play, Shuffle, MoreVertical, Clock3, ListVideo } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const videos = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  title: `Building a Streaming Platform Part ${i + 1}`,
  channel: "StreamStack",
  duration: "12:45",
  views: `${(i + 1) * 10}K views`,
  thumbnail: `https://picsum.photos/600/340?random=${i}`,
}));

export default function PlaylistDetailsPage() {
  return (
    <div className="w-full px-8 py-8">
      <Card className="overflow-hidden border-zinc-800 bg-zinc-950/50">
        <CardContent className="p-0">
          <div className="relative h-72">
            <img
              src="https://picsum.photos/1600/600"
              alt="Playlist Cover"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

            <div className="absolute bottom-0 left-0 p-8">
              <div className="mb-3 flex items-center gap-2 text-zinc-300">
                <ListVideo className="h-4 w-4" />
                Playlist
              </div>

              <h1 className="text-4xl font-bold">
                Backend Engineering Roadmap
              </h1>

              <p className="mt-2 max-w-2xl text-zinc-400">
                Complete backend roadmap playlist.
              </p>

              <div className="mt-4 flex gap-4 text-sm text-zinc-400">
                <span>12 videos</span>
                <span>•</span>
                <span>4.8 hours</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-3">
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

      <div className="mt-8 space-y-3">
        {videos.map((video, index) => (
          <Card key={video.id} className="group border-zinc-800 bg-zinc-950/40">
            <CardContent className="p-3">
              <div className="flex items-center gap-4">
                <div className="w-8 text-center text-zinc-500">{index + 1}</div>

                <div className="relative w-56 shrink-0 overflow-hidden rounded-xl">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="aspect-video w-full object-cover"
                  />

                  <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs">
                    {video.duration}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold">{video.title}</h3>

                  <p className="mt-2 text-sm text-zinc-400">{video.channel}</p>

                  <p className="mt-1 text-xs text-zinc-500">{video.views}</p>
                </div>

                <div className="hidden lg:flex items-center gap-2 text-sm text-zinc-400">
                  <Clock3 className="h-4 w-4" />
                  {video.duration}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
