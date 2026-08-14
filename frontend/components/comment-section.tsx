"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare, Pencil, Send, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import UseApi from "@/hooks/UseApi";
import { mediaUrl } from "@/lib/video";
import {
  formatRelativeTime,
  type Comment,
  type CommentPage,
  type ReplyPage,
} from "@/lib/comment";
import { initialsOf, type ChannelSummary } from "@/lib/user";

interface CommentSectionProps {
  videoId: string;
  /** The signed-in user, so their own comments get edit/delete controls. */
  currentUserId: string | null;
  /** Uploader of the video — they can moderate any comment on it. */
  videoOwnerId: string | null;
}

export function CommentSection({
  videoId,
  currentUserId,
  videoOwnerId,
}: CommentSectionProps) {
  const { get, post, patch, del, accessToken } = UseApi();

  const [page, setPage] = useState<CommentPage | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Comments only carry an authorId, so names come from a batch channel lookup.
  const [authors, setAuthors] = useState<Record<string, ChannelSummary>>({});

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, Comment[]>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const resolveAuthors = useCallback(
    async (ids: string[]) => {
      const missing = [...new Set(ids)].filter((id) => !(id in authors));

      if (missing.length === 0) return;

      try {
        const res = await get(
          `/api/user/channels/by-owner?ids=${missing.join(",")}`,
        );

        setAuthors((current) => {
          const next = { ...current };
          for (const channel of res.data as ChannelSummary[]) {
            next[channel.ownerId] = channel;
          }
          return next;
        });
      } catch {
        // Names are decorative — fall back to the id-derived placeholder.
      }
    },
    [authors, get],
  );

  const load = useCallback(
    async (cursor?: string) => {
      const res = await get(
        `/api/video/${videoId}/comments${cursor ? `?cursor=${cursor}` : ""}`,
      );

      const data = res.data as CommentPage;

      setPage((current) =>
        current && cursor
          ? { ...data, comments: [...current.comments, ...data.comments] }
          : data,
      );

      resolveAuthors(data.comments.map((comment) => comment.authorId));
    },
    [get, videoId, resolveAuthors],
  );

  useEffect(() => {
    if (!videoId) return;
    load();
  }, [videoId]);

  function authorName(authorId: string) {
    return authors[authorId]?.name ?? `user-${authorId.slice(0, 6)}`;
  }

  function authorAvatar(authorId: string) {
    return mediaUrl(authors[authorId]?.avatarUrl ?? null, accessToken);
  }

  function canModify(comment: Comment) {
    return (
      comment.authorId === currentUserId ||
      (videoOwnerId !== null && videoOwnerId === currentUserId)
    );
  }

  async function submit(text: string, parentId?: string) {
    if (!text.trim() || pending) return;

    setPending(true);
    setError(null);

    try {
      const res = await post(`/api/video/${videoId}/comments`, {
        text,
        ...(parentId ? { parentId } : {}),
      });

      const created = res.data as Comment;

      if (parentId) {
        setReplies((current) => ({
          ...current,
          [parentId]: [...(current[parentId] ?? []), created],
        }));

        setPage((current) =>
          current
            ? {
                ...current,
                total: current.total + 1,
                comments: current.comments.map((comment) =>
                  comment.id === parentId
                    ? { ...comment, replyCount: comment.replyCount + 1 }
                    : comment,
                ),
              }
            : current,
        );

        setReplyingTo(null);
      } else {
        setPage((current) =>
          current
            ? {
                ...current,
                total: current.total + 1,
                comments: [created, ...current.comments],
              }
            : { total: 1, nextCursor: null, comments: [created] },
        );

        setDraft("");
      }

      resolveAuthors([created.authorId]);
    } catch {
      setError("Could not post your comment. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function toggleReplies(comment: Comment) {
    if (replies[comment.id]) {
      setReplies((current) => {
        const next = { ...current };
        delete next[comment.id];
        return next;
      });
      return;
    }

    const res = await get(`/api/video/comments/${comment.id}/replies`);
    const data = res.data as ReplyPage;

    setReplies((current) => ({ ...current, [comment.id]: data.replies }));
    resolveAuthors(data.replies.map((reply) => reply.authorId));
  }

  async function saveEdit(comment: Comment) {
    if (!editDraft.trim()) return;

    const res = await patch(`/api/video/comments/${comment.id}`, {
      text: editDraft,
    });

    const updated = res.data as Comment;

    const replace = (list: Comment[]) =>
      list.map((item) => (item.id === updated.id ? updated : item));

    setPage((current) =>
      current ? { ...current, comments: replace(current.comments) } : current,
    );

    setReplies((current) =>
      Object.fromEntries(
        Object.entries(current).map(([key, list]) => [key, replace(list)]),
      ),
    );

    setEditingId(null);
  }

  async function remove(comment: Comment) {
    await del(`/api/video/comments/${comment.id}`);

    const drop = (list: Comment[]) =>
      list.filter((item) => item.id !== comment.id);

    if (comment.parentId) {
      setReplies((current) => ({
        ...current,
        [comment.parentId!]: drop(current[comment.parentId!] ?? []),
      }));
    }

    setPage((current) =>
      current
        ? {
            ...current,
            total: Math.max(0, current.total - 1),
            comments: drop(current.comments),
          }
        : current,
    );
  }

  function renderComment(comment: Comment, isReply = false) {
    return (
      <Card
        key={comment.id}
        className={`border-zinc-800 bg-zinc-950/30 p-4 ${isReply ? "ml-12" : ""}`}
      >
        <div className="flex gap-3">
          <Avatar className={isReply ? "h-8 w-8" : undefined}>
            {authorAvatar(comment.authorId) && (
              <AvatarImage
                src={authorAvatar(comment.authorId)!}
                alt={authorName(comment.authorId)}
              />
            )}

            <AvatarFallback>
              {initialsOf(authorName(comment.authorId))}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{authorName(comment.authorId)}</p>

              <span className="text-xs text-zinc-500">
                {formatRelativeTime(comment.createdAt)}
                {comment.edited ? " (edited)" : ""}
              </span>
            </div>

            {editingId === comment.id ? (
              <div className="mt-2">
                <Textarea
                  value={editDraft}
                  onChange={(event) => setEditDraft(event.target.value)}
                  className="min-h-[70px] resize-none border-zinc-800 bg-zinc-900/50"
                />

                <div className="mt-2 flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>

                  <Button
                    className="bg-white text-black hover:bg-zinc-200"
                    onClick={() => saveEdit(comment)}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-300">
                {comment.text}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-1">
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400"
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                >
                  Reply
                </Button>
              )}

              {!isReply && comment.replyCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-violet-400"
                  onClick={() => toggleReplies(comment)}
                >
                  <MessageSquare className="mr-2 h-3.5 w-3.5" />
                  {replies[comment.id] ? "Hide" : "Show"} {comment.replyCount}{" "}
                  {comment.replyCount === 1 ? "reply" : "replies"}
                </Button>
              )}

              {canModify(comment) && (
                <>
                  {comment.authorId === currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditDraft(comment.text);
                      }}
                    >
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Edit
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400"
                    onClick={() => remove(comment)}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </>
              )}
            </div>

            {replyingTo === comment.id && (
              <ReplyComposer
                pending={pending}
                onCancel={() => setReplyingTo(null)}
                onSubmit={(text) => submit(text, comment.id)}
              />
            )}

            {replies[comment.id]?.map((reply) => (
              <div key={reply.id} className="mt-3">
                {renderComment(reply, true)}
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="mb-6">
      <div className="my-8 rounded-xl">
        <h2 className="mb-5 text-xl font-semibold">
          Comments ({page?.total ?? 0})
        </h2>

        <Card className="border-zinc-800 bg-zinc-950/40">
          <div className="p-4">
            <div className="flex gap-4">
              <Avatar>
                {currentUserId && authorAvatar(currentUserId) && (
                  <AvatarImage src={authorAvatar(currentUserId)!} alt="You" />
                )}

                <AvatarFallback>
                  {currentUserId ? initialsOf(authorName(currentUserId)) : "??"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <Textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Add a comment..."
                  className="min-h-[90px] resize-none border-zinc-800 bg-zinc-900/50 focus-visible:ring-violet-500"
                />

                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setDraft("")}>
                    Cancel
                  </Button>

                  <Button
                    disabled={pending || !draft.trim()}
                    className="bg-white text-black hover:bg-zinc-200"
                    onClick={() => submit(draft)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {page?.comments.length === 0 && (
          <p className="text-sm text-zinc-500">
            No comments yet. Be the first to say something.
          </p>
        )}

        {page?.comments.map((comment) => renderComment(comment))}
      </div>

      {page?.nextCursor && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            className="border-zinc-700"
            onClick={() => load(page.nextCursor!)}
          >
            Load more comments
          </Button>
        </div>
      )}
    </div>
  );
}

function ReplyComposer({
  pending,
  onCancel,
  onSubmit,
}: {
  pending: boolean;
  onCancel: () => void;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState("");

  return (
    <div className="mt-3">
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Write a reply..."
        className="min-h-[70px] resize-none border-zinc-800 bg-zinc-900/50"
      />

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          disabled={pending || !text.trim()}
          className="bg-white text-black hover:bg-zinc-200"
          onClick={() => onSubmit(text)}
        >
          Reply
        </Button>
      </div>
    </div>
  );
}
