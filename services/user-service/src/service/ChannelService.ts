import channelRepository from "../repository/ChannelRepository.js";
import profileRepository from "../repository/ProfileRepository.js";
import type {
  CreateChannelInput,
  UpdateChannelInput,
} from "../validation/index.js";

import { ConflictError, NotFoundError } from "@video-streaming/common";

class ChannelService {
  /**
   * Create channel
   */
  async createChannel(userId: string, data: CreateChannelInput) {
    const profile = await profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Create a profile before creating a channel.");
    }

    const existingChannel = await channelRepository.findByOwnerId(userId);

    if (existingChannel) {
      throw new ConflictError("You already own a channel.");
    }

    const handleExists = await channelRepository.findByHandle(data.handle);

    if (handleExists) {
      throw new ConflictError("Channel handle already exists.");
    }

    return channelRepository.create({
      ownerId: userId,
      ...data,
    });
  }

  /**
   * Get my channel
   */
  async getMyChannel(userId: string) {
    const channel = await channelRepository.findByOwnerId(userId);

    if (!channel) {
      throw new NotFoundError("Channel not found.");
    }

    return channel;
  }

  /**
   * Public channel lookup
   */
  async getChannelByHandle(handle: string) {
    const channel = await channelRepository.findByHandle(handle);

    if (!channel) {
      throw new NotFoundError("Channel not found.");
    }

    return channel;
  }

  /**
   * Batch lookup used to attach channel identity to video-service records.
   * Missing ids are simply absent from the result.
   */
  async getChannelsByOwnerIds(ownerIds: string[]) {
    const unique = [...new Set(ownerIds)].slice(0, 100);

    if (unique.length === 0) {
      return [];
    }

    const channels = await channelRepository.findManyByOwnerIds(unique);

    return channels.map((channel) => ({
      id: channel.id,
      ownerId: channel.ownerId,
      handle: channel.handle,
      name: channel.name,
      avatarUrl: channel.avatarUrl,
    }));
  }

  /**
   * Update channel
   */
  async updateChannel(userId: string, data: UpdateChannelInput) {
    const channel = await channelRepository.findByOwnerId(userId);

    if (!channel) {
      throw new NotFoundError("Channel not found.");
    }

    if (data.handle && data.handle !== channel.handle) {
      const handleExists = await channelRepository.findByHandle(data.handle);

      if (handleExists) {
        throw new ConflictError("Handle already taken.");
      }
    }

    return channelRepository.update(userId, data);
  }

  /**
   * Delete channel
   */
  async deleteChannel(userId: string) {
    const channel = await channelRepository.findByOwnerId(userId);

    if (!channel) {
      throw new NotFoundError("Channel not found.");
    }

    await channelRepository.delete(userId);
  }
}

const channelService = new ChannelService();

export default channelService;
