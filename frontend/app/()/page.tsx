import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { HeroBanner } from "@/components/hero-banner";
import { CategoryTabs } from "@/components/category-tabs";
import { VideoCard } from "@/components/video-card";

const videos = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  title: `Building a Distributed Streaming Platform ${i + 1}`,
  channel: "StreamStack",
  views: "120K views",
  thumbnail: `https://picsum.photos/600/340?random=${i}`,
}));

export default function HomePage() {
  return (
    <div>
      <HeroBanner />

      <div className="mt-8">
        <CategoryTabs />
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video.id} {...video} />
        ))}
      </div>
    </div>
  );
}
