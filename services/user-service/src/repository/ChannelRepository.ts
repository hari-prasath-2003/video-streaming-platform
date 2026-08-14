import { prisma } from "../config/db.js";
import type {
  CreateChannelInput,
  UpdateChannelInput,
} from "../validation/index.js";
import { definedFields } from "../utils/PatchData.js";

class ChannelRepository {
  private prismaClient = prisma;

  async create(data: CreateChannelInput & { ownerId: string }) {
    return this.prismaClient.channel.create({
      data: {
        ownerId: data.ownerId,
        handle: data.handle,
        name: data.name,
        description: data.description ?? null,
        avatarUrl: data.avatarUrl ?? null,
        bannerUrl: data.bannerUrl ?? null,
        visibility: data.visibility ?? "PUBLIC",
      },
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

  async findManyByOwnerIds(ownerIds: string[]) {
    return this.prismaClient.channel.findMany({
      where: { ownerId: { in: ownerIds } },
    });
  }

  /**
   * Case-insensitive match on handle or channel name. Private channels are
   * never surfaced in search results.
   */
  async search(term: string, limit: number) {
    return this.prismaClient.channel.findMany({
      where: {
        visibility: "PUBLIC",
        OR: [
          { handle: { contains: term, mode: "insensitive" } },
          { name: { contains: term, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { _count: { select: { subscribers: true } } },
    });
  }

  async update(ownerId: string, data: UpdateChannelInput) {
    return this.prismaClient.channel.update({
      where: { ownerId },
      data: definedFields(data),
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
