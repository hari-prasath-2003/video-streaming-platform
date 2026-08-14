import { prisma } from "../config/db.js";

class VideoLikeRepository {
  private prismaClient = prisma;

  async like(videoId: string, userId: string) {
    return this.prismaClient.videoLike.create({ data: { videoId, userId } });
  }

  async unlike(videoId: string, userId: string) {
    return this.prismaClient.videoLike.delete({
      where: { videoId_userId: { videoId, userId } },
    });
  }

  async find(videoId: string, userId: string) {
    return this.prismaClient.videoLike.findUnique({
      where: { videoId_userId: { videoId, userId } },
    });
  }
}

const videoLikeRepository = new VideoLikeRepository();

export default videoLikeRepository;
