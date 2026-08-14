import { PrismaClient, User } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

class SessionRepository {
  private adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  private prismaClient: PrismaClient = new PrismaClient({
    adapter: this.adapter,
  });

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.prismaClient.user.findFirst({
      where: {
        email: email,
      },
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.prismaClient.user.findFirst({
      where: {
        id: id,
      },
    });
  }

  createUser(email: string, password: string): Promise<User> {
    return this.prismaClient.user.create({
      data: {
        email: email,
        passwordHash: password,
      },
    });
  }

  updatePassword(id: string, passwordHash: string): Promise<User> {
    return this.prismaClient.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  /**
   * Changing the email invalidates any prior verification.
   */
  updateEmail(id: string, email: string): Promise<User> {
    return this.prismaClient.user.update({
      where: { id },
      data: { email, emailVerified: false },
    });
  }

  deleteUser(id: string): Promise<User> {
    return this.prismaClient.user.delete({
      where: { id },
    });
  }
}

const sessionRepository = new SessionRepository();
export default sessionRepository;
