"use client";

import { Flame, TrendingUp, Eye, Play } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "Technology",
    icon: "💻",
    videos: Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      title: `Building Scalable Backend Systems ${i + 1}`,
      channel: "Tech Stack",
      views: `${(i + 1) * 250}K views`,
      thumbnail: `https://picsum.photos/600/340?random=${i + 1}`,
    })),
  },
  {
    title: "Gaming",
    icon: "🎮",
    videos: Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      title: `GTA 6 Gameplay Secrets ${i + 1}`,
      channel: "Gaming Hub",
      views: `${(i + 2) * 500}K views`,
      thumbnail: `https://picsum.photos/600/340?random=${i + 10}`,
    })),
  },
  {
    title: "Music",
    icon: "🎵",
    videos: Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      title: `Top Viral Songs 2026 #${i + 1}`,
      channel: "Music Central",
      views: `${(i + 1) * 800}K views`,
      thumbnail: `https://picsum.photos/600/340?random=${i + 20}`,
    })),
  },
  {
    title: "Education",
    icon: "🎓",
    videos: Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      title: `System Design Interview ${i + 1}`,
      channel: "AlgoVision",
      views: `${(i + 1) * 150}K views`,
      thumbnail: `https://picsum.photos/600/340?random=${i + 30}`,
    })),
  },
];

export default function TrendingPage() {
  return (
    <div className="w-full px-8 py-8">
      {/* Hero */}
      <Card className="overflow-hidden border-zinc-800 bg-gradient-to-r from-orange-950/60 via-zinc-950 to-zinc-950">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-500/10">
              <Flame className="h-12 w-12 text-orange-400" />
            </div>

            <div>
              <p className="text-sm uppercase tracking-wider text-zinc-400">
                Explore
              </p>

              <h1 className="mt-2 text-4xl font-bold">Trending</h1>

              <p className="mt-2 text-zinc-400">
                Discover what's popular across the platform.
              </p>

              <div className="mt-5 flex gap-3">
                <Button>
                  <Play className="mr-2 h-4 w-4 fill-current" />
                  Watch Trending
                </Button>

                <Button variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Live Rankings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Video */}
      <div className="mt-10">
        <h2 className="mb-4 text-2xl font-semibold">
          🔥 #1 Trending Worldwide
        </h2>

        <Card className="overflow-hidden border-orange-500/20 bg-zinc-950/40">
          <CardContent className="p-0">
            <div className="grid lg:grid-cols-2">
              <img
                src="https://picsum.photos/1200/700"
                alt="Trending"
                className="h-full w-full object-cover"
              />

              <div className="flex flex-col justify-center p-8">
                <div className="mb-3 w-fit rounded-full bg-orange-500/10 px-3 py-1 text-xs text-orange-400">
                  #1 Trending
                </div>

                <h3 className="text-3xl font-bold">
                  Building Netflix at Global Scale
                </h3>

                <p className="mt-3 text-zinc-400">
                  Learn how modern streaming platforms handle millions of users
                  worldwide.
                </p>

                <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                  <Eye className="h-4 w-4" />
                  8.2M views
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {section.icon} {section.title}
              </h2>

              <Button
                variant="ghost"
                className="text-violet-400 hover:text-violet-300"
              >
                View All
              </Button>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-4">
              {section.videos.map((video) => (
                <Card
                  key={video.id}
                  className="
                    min-w-[340px]
                    max-w-[340px]
                    overflow-hidden
                    border-zinc-800
                    bg-zinc-950/40
                    transition-all
                    hover:border-orange-500/30
                    hover:-translate-y-1
                  "
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="aspect-video w-full object-cover"
                      />

                      <div className="absolute right-2 bottom-2 rounded bg-black/80 px-2 py-1 text-xs">
                        12:45
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="line-clamp-2 font-semibold">
                        {video.title}
                      </h3>

                      <p className="mt-2 text-sm text-zinc-400">
                        {video.channel}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {video.views}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
