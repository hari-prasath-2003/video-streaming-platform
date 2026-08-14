import { prisma } from "../config/db.js";

class ChannelRepository {
  private prismaClient = prisma;

  async create(data: {
    ownerId: string;
    handle: string;
    name: string;
    description?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    visibility?: "PUBLIC" | "PRIVATE";
  }) {
    return this.prismaClient.channel.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prismaClient.channel.findUnique({
      where: { id },
    });
  }

  async findByOwnerId(ownerId: string) {
    return this.prismaClient.channel.findUnique({
      where: { ownerId },
    });
  }

  async findByHandle(handle: string) {
    return this.prismaClient.channel.findUnique({
      where: { handle },
    });
  }

  async update(
    ownerId: string,
    data: {
      name?: string;
      handle?: string;
      description?: string | null;
      avatarUrl?: string | null;
      bannerUrl?: string | null;
      visibility?: "PUBLIC" | "PRIVATE";
    },
  ) {
    return this.prismaClient.channel.update({
      where: { ownerId },
      data,
    });
  }

  async delete(ownerId: string) {
    return this.prismaClient.channel.delete({
      where: { ownerId },
    });
  }
}

const channelRepository = new ChannelRepository();

export default channelRepository;
