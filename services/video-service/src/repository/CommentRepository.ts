import { prisma } from "../config/db.js";

class CommentRepository {
  private prismaClient = prisma;

  async create(data: {
    videoId: string;
    authorId: string;
    parentId?: string | undefined;
    text: string;
  }) {
    return this.prismaClient.comment.create({
      data: {
        ...data,
        parentId: data.parentId ?? null,
      },
      include: { _count: { select: { replies: true } } },
    });
  }

  async findById(id: string) {
    return this.prismaClient.comment.findUnique({
      where: { id },
      include: { _count: { select: { replies: true } } },
    });
  }

  /**
   * Top-level comments for a video, newest first, keyset-paginated by id.
   */
  async findTopLevel(videoId: string, limit: number, cursor?: string) {
    return this.prismaClient.comment.findMany({
      where: { videoId, parentId: null },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: { _count: { select: { replies: true } } },
    });
  }

  /**
   * Replies to a comment, oldest first so a thread reads top to bottom.
   */
  async findReplies(parentId: string, limit: number, cursor?: string) {
    return this.prismaClient.comment.findMany({
      where: { parentId },
      orderBy: { createdAt: "asc" },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: { _count: { select: { replies: true } } },
    });
  }

  async countForVideo(videoId: string) {
    return this.prismaClient.comment.count({ where: { videoId } });
  }

  async update(id: string, text: string) {
    return this.prismaClient.comment.update({
      where: { id },
      data: { text, edited: true },
      include: { _count: { select: { replies: true } } },
    });
  }

  async delete(id: string) {
    return this.prismaClient.comment.delete({ where: { id } });
  }
}

const commentRepository = new CommentRepository();

export default commentRepository;
