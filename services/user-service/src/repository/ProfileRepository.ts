import { prisma } from "../config/db.js";

class ProfileRepository {
  private prismaClient = prisma;

  async create(data: {
    userId: string;
    username: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    bannerUrl?: string;
  }) {
    return this.prismaClient.profile.create({
      data,
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

  async update(
    userId: string,
    data: {
      username?: string;
      displayName?: string;
      bio?: string | null;
      avatarUrl?: string | null;
      bannerUrl?: string | null;
    },
  ) {
    return this.prismaClient.profile.update({
      where: { userId },
      data,
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
