export interface Comment {
  id: string;
  videoId: string;
  authorId: string;
  parentId: string | null;
  text: string;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
}

/** GET /api/video/:id/comments */
export interface CommentPage {
  total: number;
  nextCursor: string | null;
  comments: Comment[];
}

/** GET /api/video/comments/:id/replies */
export interface ReplyPage {
  nextCursor: string | null;
  replies: Comment[];
}

export function formatRelativeTime(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

  if (seconds < 60) return "just now";

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];

  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto",
  });

  for (const [unit, unitSeconds] of units) {
    if (seconds >= unitSeconds) {
      return formatter.format(-Math.floor(seconds / unitSeconds), unit);
    }
  }

  return "just now";
}
