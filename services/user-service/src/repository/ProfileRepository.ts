import { prisma } from "../config/db.js";
import type {
  CreateProfileInput,
  UpdateProfileInput,
} from "../validation/index.js";
import { definedFields } from "../utils/PatchData.js";

class ProfileRepository {
  private prismaClient = prisma;

  async create(data: CreateProfileInput & { userId: string }) {
    return this.prismaClient.profile.create({
      data: {
        userId: data.userId,
        username: data.username,
        displayName: data.displayName,
        bio: data.bio ?? null,
        avatarUrl: data.avatarUrl ?? null,
        bannerUrl: data.bannerUrl ?? null,
      },
    });
  }

  async findById(id: string) {
    return this.prismaClient.profile.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string) {
    return this.prismaClient.profile.findUnique({
      where: { userId },
    });
  }

  async findByUsername(username: string) {
    return this.prismaClient.profile.findUnique({
      where: { username },
    });
  }

  /**
   * Case-insensitive match on username or display name.
   */
  async search(term: string, limit: number) {
    return this.prismaClient.profile.findMany({
      where: {
        OR: [
          { username: { contains: term, mode: "insensitive" } },
          { displayName: { contains: term, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async update(userId: string, data: UpdateProfileInput) {
    return this.prismaClient.profile.update({
      where: { userId },
      data: definedFields(data),
    });
  }

  async delete(userId: string) {
    return this.prismaClient.profile.delete({
      where: { userId },
    });
  }
}

const profileRepository = new ProfileRepository();

export default profileRepository;
