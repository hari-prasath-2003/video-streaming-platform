"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VideoCard } from "@/components/video-card";
import UseApi from "@/hooks/UseApi";
import { formatViews, mediaUrl } from "@/lib/video";
import { initialsOf } from "@/lib/user";
import type {
  SearchChannel,
  SearchProfile,
  SearchResults,
  SearchVideo,
} from "@/lib/search";

function SearchResultsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { get, accessToken } = UseApi();

  const query = searchParams.get("q") ?? "";

  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFailed(false);

    // search-service fans the term out to user-service and video-service and
    // merges the three result types, so the client makes one call.
    get(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!cancelled) setResults(res.data as SearchResults);
      })
      .catch(() => {
        if (!cancelled) {
          setResults(null);
          setFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  async function loadMoreVideos() {
    if (!results?.nextCursor) return;

    // type=video keeps the follow-up page from re-running the people and
    // channel halves, which are unpaged and already on screen.
    const res = await get(
      `/api/search?q=${encodeURIComponent(query)}&type=video&cursor=${results.nextCursor}`,
    );

    const next = res.data as SearchResults;

    setResults({
      ...results,
      videos: [...results.videos, ...next.videos],
      nextCursor: next.nextCursor,
    });
  }

  if (!query.trim()) {
    return (
      <p className="text-sm text-zinc-400">
        Type something in the search bar to get started.
      </p>
    );
  }

  const profiles = results?.profiles ?? [];
  const channels = results?.channels ?? [];
  const videos = results?.videos ?? [];

  const hasResults =
    profiles.length > 0 || channels.length > 0 || videos.length > 0;

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Results for <span className="text-violet-400">{query}</span>
      </h1>

      {loading && <p className="text-sm text-zinc-400">Searching…</p>}

      {!loading && failed && (
        <p className="text-sm text-zinc-400">
          Search is unavailable right now. Try again in a moment.
        </p>
      )}

      {!loading && !failed && !hasResults && (
        <p className="text-sm text-zinc-400">
          Nothing matched that search. Try a different term.
        </p>
      )}

      {channels.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">Channels</h2>

          <div className="space-y-3">
            {channels.map((channel) => (
              <ChannelResult
                key={channel.id}
                channel={channel}
                accessToken={accessToken}
                onOpen={() => router.push(`/channel/${channel.handle}`)}
              />
            ))}
          </div>
        </section>
      )}

      {profiles.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">People</h2>

          <div className="space-y-3">
            {profiles.map((profile) => (
              <ProfileResult
                key={profile.userId}
                profile={profile}
                accessToken={accessToken}
              />
            ))}
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Videos</h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <Link key={video.id} href={`/watch/${video.id}`}>
                <VideoResult video={video} accessToken={accessToken} />
              </Link>
            ))}
          </div>

          {results?.nextCursor && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                className="border-zinc-700"
                onClick={loadMoreVideos}
              >
                Load more
              </Button>
            </div>
          )}
        </section>
      )}
    </>
  );
}

function ChannelResult({
  channel,
  accessToken,
  onOpen,
}: {
  channel: SearchChannel;
  accessToken: string | null;
  onOpen: () => void;
}) {
  return (
    <Card
      className="cursor-pointer border-zinc-800 bg-zinc-950/40 p-4 transition-colors hover:border-violet-500/40"
      onClick={onOpen}
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          {channel.avatarUrl && (
            <AvatarImage
              src={mediaUrl(channel.avatarUrl, accessToken)!}
              alt={channel.name}
            />
          )}

          <AvatarFallback>{initialsOf(channel.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <h3 className="font-semibold">{channel.name}</h3>

          <p className="text-sm text-zinc-400">
            @{channel.handle} · {channel.subscriberCount} subscribers
          </p>

          {channel.description && (
            <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
              {channel.description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function ProfileResult({
  profile,
  accessToken,
}: {
  profile: SearchProfile;
  accessToken: string | null;
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-950/40 p-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          {profile.avatarUrl && (
            <AvatarImage
              src={mediaUrl(profile.avatarUrl, accessToken)!}
              alt={profile.displayName}
            />
          )}

          <AvatarFallback>{initialsOf(profile.displayName)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <h3 className="font-semibold">{profile.displayName}</h3>

          <p className="text-sm text-zinc-400">@{profile.username}</p>

          {profile.bio && (
            <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function VideoResult({
  video,
  accessToken,
}: {
  video: SearchVideo;
  accessToken: string | null;
}) {
  return (
    <VideoCard
      title={video.title}
      // The uploader always has an id; the channel name is best-effort, so fall
      // back to a truncated id rather than showing nothing.
      channel={video.channel?.name ?? video.channelId.slice(0, 8)}
      channelAvatar={mediaUrl(video.channel?.avatarUrl ?? null, accessToken)}
      views={formatViews(video.viewCount)}
      thumbnail={
        mediaUrl(video.thumbnailUrl, accessToken) ||
        `https://picsum.photos/600/340?random=${video.id}`
      }
    />
  );
}

export default function SearchPage() {
  return (
    <div className="w-full px-6 py-6">
      {/* useSearchParams needs a Suspense boundary so the rest of the route
          can still be prerendered. */}
      <Suspense fallback={<p className="text-sm text-zinc-400">Loading…</p>}>
        <SearchResultsView />
      </Suspense>
    </div>
  );
}
