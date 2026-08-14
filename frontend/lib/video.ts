export interface Video {
  id: string;
  channelId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoUrl: string;
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
  visibility: "PUBLIC" | "PRIVATE" | "UNLISTED";
  uploadedAt: string;
  liked?: boolean;
}

const gatewayUrl = process.env.NEXT_PUBLIC_BACKEND_GATEWAY_URL;

// <video>/<img> tags can't send an Authorization header, so media URLs
// carry the access token as a query param instead (see gateway authenticate.ts).
export function mediaUrl(path: string | null, accessToken: string | null) {
  if (!path) return null;
  return `${gatewayUrl}${path}${accessToken ? `?token=${accessToken}` : ""}`;
}

export function formatViews(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K views`;
  return `${count} views`;
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
