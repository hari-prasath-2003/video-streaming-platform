"use client";

import Link from "next/link";
import { HeroBanner } from "@/components/hero-banner";
import { CategoryTabs } from "@/components/category-tabs";
import { VideoCard } from "@/components/video-card";
import UseApi from "@/hooks/UseApi";
import { useEffect, useState } from "react";
import { mediaUrl, formatViews, type Video } from "@/lib/video";
import type { ChannelSummary } from "@/lib/user";

export default function HomePage() {
  const { get, accessToken } = UseApi();
  const [videos, setVideos] = useState<Video[]>([]);
  const [channels, setChannels] = useState<Record<string, ChannelSummary>>({});

  useEffect(() => {
    get("/api/video").then((res) => setVideos(res.data));
  }, []);

  // Videos carry the uploader's userId only, so names and avatars come from a
  // single batched user-service lookup rather than one call per card.
  useEffect(() => {
    const ids = [...new Set(videos.map((video) => video.channelId))];

    if (ids.length === 0) return;

    get(`/api/user/channels/by-owner?ids=${ids.join(",")}`)
      .then((res) =>
        setChannels(
          Object.fromEntries(
            (res.data as ChannelSummary[]).map((c) => [c.ownerId, c]),
          ),
        ),
      )
      .catch(() => {
        // Decorative only — cards fall back to the id-derived placeholder.
      });
  }, [videos]);

  return (
    <div>
      <HeroBanner />

      <div className="mt-8">
        <CategoryTabs />
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
        {videos.map((video) => (
          <Link key={video.id} href={`/watch/${video.id}`}>
            <VideoCard
              title={video.title}
              channel={
                channels[video.channelId]?.name ?? video.channelId.slice(0, 8)
              }
              channelAvatar={mediaUrl(
                channels[video.channelId]?.avatarUrl ?? null,
                accessToken,
              )}
              views={formatViews(video.viewCount)}
              thumbnail={
                mediaUrl(video.thumbnailUrl, accessToken) ||
                `https://picsum.photos/600/340?random=${video.id}`
              }
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
