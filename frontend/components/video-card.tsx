import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface VideoCardProps {
  title: string;
  channel: string;
  views: string;
  thumbnail: string;
}

export function VideoCard({
  title,
  channel,
  views,
  thumbnail,
}: VideoCardProps) {
  return (
    <Card className="group w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/40 transition-all hover:border-zinc-600 hover:shadow-lg hover:shadow-purple-500/10 py-0">
      {/* IMAGE - FULL TOP FLUSH */}
      <div className="relative w-full overflow-hidden rounded-t-xl">
        <img
          src={thumbnail}
          alt={title}
          className="h-full w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* CONTENT */}
      <div className="flex gap-3 p-4">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-zinc-800 text-xs text-white">
            {channel.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white">
            {title}
          </h3>

          <p className="mt-1 text-xs text-zinc-400">{channel}</p>

          <p className="text-xs text-zinc-500">{views}</p>
        </div>
      </div>
    </Card>
  );
}
