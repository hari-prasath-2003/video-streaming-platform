import subscriptionRepository from "../repository/SubscriptionRepository.js";
import channelRepository from "../repository/ChannelRepository.js";
import profileRepository from "../repository/ProfileRepository.js";

import { ConflictError, NotFoundError } from "@video-streaming/common";

class SubscriptionService {
  /**
   * Subscribe to a channel
   */
  async subscribe(subscriberId: string, channelId: string) {
    const profile = await profileRepository.findByUserId(subscriberId);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    const channel = await channelRepository.findById(channelId);

    if (!channel) {
      throw new NotFoundError("Channel not found.");
    }

    if (channel.ownerId === subscriberId) {
      throw new ConflictError("You cannot subscribe to your own channel.");
    }

    const existing = await subscriptionRepository.findSubscription(
      subscriberId,
      channelId,
    );

    if (existing) {
      throw new ConflictError("Already subscribed.");
    }

    return subscriptionRepository.subscribe(subscriberId, channelId);
  }

  /**
   * Unsubscribe
   */
  async unsubscribe(subscriberId: string, channelId: string) {
    const existing = await subscriptionRepository.findSubscription(
      subscriberId,
      channelId,
    );

    if (!existing) {
      return;
    }

    await subscriptionRepository.unsubscribe(subscriberId, channelId);
  }

  /**
   * Subscriber count
   */
  async getSubscriberCount(channelId: string) {
    const channel = await channelRepository.findById(channelId);

    if (!channel) {
      throw new NotFoundError("Channel not found.");
    }

    const count = await subscriptionRepository.countSubscribers(channelId);

    return {
      channelId,
      subscribers: count,
    };
  }

  /**
   * Channels I'm subscribed to
   */
  async getMySubscriptions(subscriberId: string) {
    return subscriptionRepository.getUserSubscriptions(subscriberId);
  }

  /**
   * Is subscribed
   */
  async isSubscribed(subscriberId: string, channelId: string) {
    return subscriptionRepository.isSubscribed(subscriberId, channelId);
  }
}

const subscriptionService = new SubscriptionService();

export default subscriptionService;
