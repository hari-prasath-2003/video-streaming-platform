"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Bell,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { CommentSection } from "@/components/comment-section";
import UseApi from "@/hooks/UseApi";
import UseAccount from "@/hooks/UseAccount";
import { mediaUrl, formatViews, type Video } from "@/lib/video";
import { initialsOf, type ChannelSummary } from "@/lib/user";

const recommendations = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  title: `Backend Engineering Tutorial ${i + 1}`,
  channel: "CodeVerse",
  views: `${(i + 1) * 50}K views`,
  duration: `${10 + i}:${String(20 + i).padStart(2, "0")}`,
  thumbnail: `https://picsum.photos/500/300?random=${i}`,
}));

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const { get, post, del, accessToken } = UseApi();
  const { account } = UseAccount();
  const [video, setVideo] = useState<Video | null>(null);
  const [channel, setChannel] = useState<ChannelSummary | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const hasRecordedView = useRef(false);

  useEffect(() => {
    if (!id) return;
    get(`/api/video/${id}`).then((res) => setVideo(res.data));
  }, [id]);

  // Video.channelId is the uploader's userId, so the channel name/avatar has
  // to be resolved from user-service separately.
  useEffect(() => {
    if (!video) return;

    get(`/api/user/channels/by-owner?ids=${video.channelId}`)
      .then((res) => setChannel((res.data as ChannelSummary[])[0] ?? null))
      .catch(() => setChannel(null));
  }, [video?.channelId]);

  useEffect(() => {
    if (!channel) return;

    get(`/api/user/channels/${channel.id}/subscribed`)
      .then((res) => setSubscribed(Boolean(res.data.subscribed)))
      .catch(() => setSubscribed(false));
  }, [channel?.id]);

  async function toggleSubscribe() {
    if (!channel) return;

    const wasSubscribed = subscribed;
    setSubscribed(!wasSubscribed);

    try {
      if (wasSubscribed) {
        await del(`/api/user/channels/${channel.id}/subscribe`);
      } else {
        await post(`/api/user/channels/${channel.id}/subscribe`, {});
      }
    } catch {
      setSubscribed(wasSubscribed);
    }
  }

  useEffect(() => {
    if (!id || hasRecordedView.current) return;
    hasRecordedView.current = true;
    post(`/api/video/${id}/views`, {});
  }, [id]);

  // Like and dislike are the same toggle from opposite ends: the server keeps
  // one reaction per user, so it returns the reconciled counts and we take them
  // as the source of truth rather than tracking both sides by hand.
  async function react(type: "LIKE" | "DISLIKE") {
    if (!video) return;

    const previous = video;
    const clearing = video.reaction === type;
    const delta = (from: "LIKE" | "DISLIKE") =>
      (video.reaction === from ? -1 : 0) + (!clearing && type === from ? 1 : 0);

    setVideo({
      ...video,
      reaction: clearing ? null : type,
      likeCount: video.likeCount + delta("LIKE"),
      dislikeCount: video.dislikeCount + delta("DISLIKE"),
    });

    try {
      const res = await post(
        `/api/video/${id}/${type === "LIKE" ? "like" : "dislike"}`,
        {},
      );

      setVideo(res.data);
    } catch {
      setVideo(previous);
    }
  }

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
              poster={mediaUrl(video?.thumbnailUrl ?? null, accessToken) || undefined}
              src={mediaUrl(video?.videoUrl ?? null, accessToken) || undefined}
            />
          </div>

          {/* Title */}
          <h1 className="mt-5 text-2xl font-bold">
            {video?.title ?? "Loading..."}
          </h1>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-zinc-400">
              {video ? formatViews(video.viewCount) : ""}
              {video ? ` • ${new Date(video.uploadedAt).toLocaleDateString()}` : ""}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => react("LIKE")}
                className={
                  video?.reaction === "LIKE" ? "text-violet-400" : undefined
                }
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                {video?.likeCount ?? 0}
              </Button>

              <Button
                variant="secondary"
                onClick={() => react("DISLIKE")}
                className={
                  video?.reaction === "DISLIKE" ? "text-violet-400" : undefined
                }
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                {video?.dislikeCount ?? 0}
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
                  {channel?.avatarUrl && (
                    <AvatarImage
                      src={mediaUrl(channel.avatarUrl, accessToken) ?? undefined}
                      alt={channel.name}
                    />
                  )}

                  <AvatarFallback>
                    {initialsOf(channel?.name ?? video?.channelId)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h3 className="font-semibold">
                    {channel?.name ?? (video ? "Unknown channel" : "")}
                  </h3>

                  {channel && (
                    <p className="text-sm text-zinc-400">@{channel.handle}</p>
                  )}
                </div>
              </div>

              <Button
                disabled={!channel || channel.ownerId === account?.userId}
                onClick={toggleSubscribe}
                className={
                  subscribed
                    ? "bg-zinc-800 text-white hover:bg-zinc-700"
                    : "bg-white text-black hover:bg-zinc-200"
                }
              >
                <Bell className="mr-2 h-4 w-4" />
                {subscribed ? "Subscribed" : "Subscribe"}
              </Button>
            </div>

            {video?.description && (
              <div className="mt-5 rounded-xl bg-zinc-900/50 p-4">
                <p className="text-sm text-zinc-300">{video.description}</p>
              </div>
            )}
          </Card>

          {/* Comments */}
          <CommentSection
            videoId={id}
            currentUserId={account?.userId ?? null}
            videoOwnerId={video?.channelId ?? null}
          />
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
