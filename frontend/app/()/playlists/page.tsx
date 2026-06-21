"use client";

import Link from "next/link";
import { ListVideo, Play } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const playlists = [
  {
    id: "backend",
    title: "Backend Engineering Roadmap",
    videos: 12,
    duration: "4.8 hours",
    thumbnail: "https://picsum.photos/800/500?random=1",
  },
  {
    id: "react",
    title: "React Masterclass",
    videos: 24,
    duration: "8.3 hours",
    thumbnail: "https://picsum.photos/800/500?random=2",
  },
  {
    id: "system-design",
    title: "System Design Interview",
    videos: 18,
    duration: "6.1 hours",
    thumbnail: "https://picsum.photos/800/500?random=3",
  },
  {
    id: "databases",
    title: "Database Engineering",
    videos: 15,
    duration: "5.2 hours",
    thumbnail: "https://picsum.photos/800/500?random=4",
  },
];

export default function PlaylistsPage() {
  return (
    <div className="w-full px-8 py-8">
      {/* Hero */}
      <Card className="overflow-hidden border-zinc-800 bg-zinc-950/50">
        <CardContent className="p-0">
          <div className="relative h-72">
            <img
              src="https://picsum.photos/1600/600?random=99"
              alt="Playlists"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

            <div className="absolute bottom-0 left-0 p-8">
              <div className="mb-3 flex items-center gap-2 text-violet-300">
                <ListVideo className="h-5 w-5" />
                Collections
              </div>

              <h1 className="text-4xl font-bold">Your Playlists</h1>

              <p className="mt-2 max-w-2xl text-zinc-400">
                Organize videos into curated collections and continue learning
                at your own pace.
              </p>

              <div className="mt-4 flex gap-4 text-sm text-zinc-400">
                <span>{playlists.length} playlists</span>
                <span>•</span>
                <span>
                  {playlists.reduce((acc, p) => acc + p.videos, 0)} videos
                </span>
                <span>•</span>
                <span>Updated recently</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Header */}
      <div className="mt-8 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">All Playlists</h2>
          <p className="text-sm text-zinc-500">Browse your saved collections</p>
        </div>
      </div>

      {/* Playlist Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {playlists.map((playlist) => (
          <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
            <Card className="group overflow-hidden border-zinc-800 bg-zinc-950/40 transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/40">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={playlist.thumbnail}
                    alt={playlist.title}
                    className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute bottom-3 right-3 rounded-lg bg-black/80 px-2 py-1 text-xs">
                    {playlist.videos} videos
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2 text-zinc-400">
                    <ListVideo className="h-4 w-4" />
                    Playlist
                  </div>

                  <h3 className="text-base font-semibold">{playlist.title}</h3>

                  <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
                    <Play className="h-3 w-3" />
                    {playlist.duration}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
