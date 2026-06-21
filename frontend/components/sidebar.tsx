"use client";

import {
  Home,
  Flame,
  History,
  ListVideo,
  ThumbsUp,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";

const items = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Flame, label: "Trending", to: "/trending" },
  { icon: History, label: "History", to: "/history" },
  { icon: ListVideo, label: "Playlists", to: "/playlists" },
  { icon: ThumbsUp, label: "Liked", to: "/liked" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

export function Sidebar() {
  const router = useRouter();

  return (
    <aside className="hidden w-64 border-r border-zinc-800 lg:block">
      <div className="p-4">
        <nav className="space-y-2">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.to)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-zinc-800"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
