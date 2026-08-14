"use client";

import Link from "next/link";
import { HeroBanner } from "@/components/hero-banner";
import { CategoryTabs } from "@/components/category-tabs";
import { VideoCard } from "@/components/video-card";
import UseApi from "@/hooks/UseApi";
import { useEffect, useState } from "react";
import { mediaUrl, formatViews, type Video } from "@/lib/video";

export default function HomePage() {
  const { get, accessToken } = UseApi();
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    get("/api/video").then((res) => setVideos(res.data));
  }, []);

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
              channel={video.channelId.slice(0, 8)}
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
