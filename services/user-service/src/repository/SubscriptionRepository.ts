import { prisma } from "../config/db.js";

class SubscriptionRepository {
  private prismaClient = prisma;

  async subscribe(subscriberId: string, channelId: string) {
    return this.prismaClient.subscription.create({
      data: {
        subscriberId,
        channelId,
      },
    });
  }

  async unsubscribe(subscriberId: string, channelId: string) {
    return this.prismaClient.subscription.delete({
      where: {
        subscriberId_channelId: {
          subscriberId,
          channelId,
        },
      },
    });
  }

  async deleteByChannelId(channelId: string) {
    return this.prismaClient.subscription.deleteMany({
      where: { channelId },
    });
  }

  async deleteBySubscriberId(subscriberId: string) {
    return this.prismaClient.subscription.deleteMany({
      where: { subscriberId },
    });
  }

  async findSubscription(subscriberId: string, channelId: string) {
    return this.prismaClient.subscription.findUnique({
      where: {
        subscriberId_channelId: {
          subscriberId,
          channelId,
        },
      },
    });
  }

  async getChannelSubscribers(channelId: string) {
    return this.prismaClient.subscription.findMany({
      where: {
        channelId,
      },
    });
  }

  async getUserSubscriptions(subscriberId: string) {
    return this.prismaClient.subscription.findMany({
      where: {
        subscriberId,
      },
      include: {
        channel: true,
      },
    });
  }

  async countSubscribers(channelId: string) {
    return this.prismaClient.subscription.count({
      where: {
        channelId,
      },
    });
  }

  async isSubscribed(subscriberId: string, channelId: string) {
    const subscription = await this.prismaClient.subscription.findUnique({
      where: {
        subscriberId_channelId: {
          subscriberId,
          channelId,
        },
      },
    });

    return subscription !== null;
  }
}

const subscriptionRepository = new SubscriptionRepository();

export default subscriptionRepository;
