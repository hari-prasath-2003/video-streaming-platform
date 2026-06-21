"use client";

import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Bell,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const recommendations = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  title: `Backend Engineering Tutorial ${i + 1}`,
  channel: "CodeVerse",
  views: `${(i + 1) * 50}K views`,
  duration: `${10 + i}:${String(20 + i).padStart(2, "0")}`,
  thumbnail: `https://picsum.photos/500/300?random=${i}`,
}));

const comments = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  user: `User ${i + 1}`,
  text: "This was one of the best explanations I've watched recently.",
}));

export default function WatchPage() {
  return (
    <div className="w-full px-6 py-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Main */}
        <div>
          {/* Video */}
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black">
            <video
              controls
              className="aspect-video w-full"
              poster="https://picsum.photos/1600/900"
            />
          </div>

          {/* Title */}
          <h1 className="mt-5 text-2xl font-bold">
            Building a Distributed Streaming Platform from Scratch
          </h1>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-zinc-400">
              1.2M views • Jun 17, 2026
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary">
                <ThumbsUp className="mr-2 h-4 w-4" />
                12K
              </Button>

              <Button variant="secondary">
                <ThumbsDown className="h-4 w-4" />
              </Button>

              <Button variant="secondary">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>

              <Button variant="secondary">
                <Bookmark className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>

          {/* Channel */}
          <Card className="mt-6 border-zinc-800 bg-zinc-950/40 p-5">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback>CV</AvatarFallback>
                </Avatar>

                <div>
                  <h3 className="font-semibold">CodeVerse</h3>

                  <p className="text-sm text-zinc-500">2.1M subscribers</p>
                </div>
              </div>

              <Button className="bg-white text-black hover:bg-zinc-200">
                <Bell className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </div>

            <div className="mt-5 rounded-xl bg-zinc-900/50 p-4">
              <p className="text-sm text-zinc-300">
                Learn how large-scale video streaming systems are built using
                microservices, queues, object storage, caching and distributed
                databases.
              </p>
            </div>
          </Card>

          {/* Comments */}
          <div className="mb-6">
            <div className="my-8 flexflex-col items-center justify-center gap-4 rounded-xl">
              <h2 className="mb-5 text-xl font-semibold">Comments (2,348)</h2>

              <Card className="border-zinc-800 bg-zinc-950/40">
                <div className="p-4">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarFallback>HP</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <Textarea
                        placeholder="Add a comment..."
                        className="
              min-h-[90px]
              resize-none
              border-zinc-800
              bg-zinc-900/50
              focus-visible:ring-violet-500
            "
                      />

                      <div className="mt-3 flex justify-end gap-2">
                        <Button variant="ghost">Cancel</Button>
                        <Button className="bg-white text-black hover:bg-zinc-200">
                          <Send className="mr-2 h-4 w-4" />
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card
                  key={comment.id}
                  className="border-zinc-800 bg-zinc-950/30 p-4"
                >
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {comment.user.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-medium">{comment.user}</p>

                      <p className="mt-1 text-sm text-zinc-400">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}

        <div>
          <h2 className="mb-4 text-lg font-semibold">Recommended</h2>

          <div className="space-y-3">
            {recommendations.map((video) => (
              <Card
                key={video.id}
                className="
    group
    overflow-hidden
    border-zinc-800
    bg-zinc-950/40
    transition-all
    hover:border-violet-500/40
    hover:bg-zinc-900/50
  "
              >
                <div className="flex gap-3 p-2">
                  {/* Thumbnail */}
                  <div className="relative w-44 shrink-0 overflow-hidden rounded-xl">
                    <div className="relative w-44 shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Duration */}
                      <div
                        className="
      absolute
      bottom-2
      right-2
      rounded-md
      bg-black/90
      px-2
      py-0.5
      text-[11px]
      font-medium
      text-white
      backdrop-blur-sm
    "
                      >
                        {video.duration}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 py-1">
                    <h3 className="line-clamp-2 text-sm font-medium leading-5">
                      {video.title}
                    </h3>

                    <p className="mt-2 text-xs text-zinc-400">
                      {video.channel}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">{video.views}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
