import { randomBytes } from "node:crypto";

import profileRepository from "../repository/ProfileRepository.js";
import channelRepository from "../repository/ChannelRepository.js";
import subscriptionRepository from "../repository/SubscriptionRepository.js";
import profileService from "./ProfileService.js";
import channelService from "./ChannelService.js";
import type {
  BootstrapAccountInput,
  UpdateAccountInput,
} from "../validation/index.js";
import { removeStoredImage } from "../utils/Storage.js";

import { NotFoundError } from "@video-streaming/common";

/**
 * Turn an email local part into a candidate username/handle.
 * Falls back to "user" when nothing usable survives sanitising.
 */
function slugFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  const slug = local.toLowerCase().replace(/[^a-z0-9_.]/g, "");

  if (slug.length < 3) {
    return "user";
  }

  return slug.slice(0, 40);
}

class AccountService {
  /**
   * Everything the account screen needs in one round trip.
   *
   * Unlike GET /profiles/me this never 404s — a freshly signed-up user has no
   * profile row yet, and the client needs to be able to tell "not set up yet"
   * apart from an error.
   */
  async getAccount(userId: string, email: string, role: string) {
    const [profile, channel, subscriptions] = await Promise.all([
      profileRepository.findByUserId(userId),
      channelRepository.findByOwnerId(userId),
      subscriptionRepository.getUserSubscriptions(userId),
    ]);

    const subscriberCount = channel
      ? await subscriptionRepository.countSubscribers(channel.id)
      : 0;

    return {
      userId,
      email,
      role,
      profile,
      channel,
      subscriberCount,
      subscriptionCount: subscriptions.length,
      // Both halves have to exist for the account to be usable — a profile
      // without a channel cannot own videos or subscribers. Reporting that
      // state as un-onboarded is what makes the client re-run bootstrap and
      // fill in the missing half.
      onboarded: profile !== null && channel !== null,
    };
  }

  /**
   * Create the profile (and a matching channel) for a user who has an auth
   * account but has never been through user-service before.
   *
   * Signup lives in auth-service and does not reach across to this service, so
   * this is what closes that gap.
   *
   * Each row is reconciled on its own rather than skipping the whole method
   * when a profile exists: accounts created before channels were part of
   * bootstrap — or left half-built by a failure between the two writes — would
   * otherwise never acquire one, since there is no other path that grants a
   * channel to an already-onboarded user. Idempotent either way.
   */
  async bootstrapAccount(
    userId: string,
    email: string,
    role: string,
    data: BootstrapAccountInput,
  ) {
    let profile = await profileRepository.findByUserId(userId);

    if (!profile) {
      const username =
        data.username ?? (await this.availableUsername(slugFromEmail(email)));

      profile = await profileService.createProfile(userId, {
        username,
        displayName: data.displayName ?? username,
      });
    }

    // A channel is what videos and subscriptions hang off, so give every
    // account one up front rather than making channel creation a second step.
    const channel = await channelRepository.findByOwnerId(userId);

    if (!channel) {
      const handle = await this.availableHandle(profile.username);

      await channelService.createChannel(userId, {
        handle,
        name: profile.displayName,
      });
    }

    return this.getAccount(userId, email, role);
  }

  /**
   * Apply the account editor's profile and channel patches together.
   */
  async updateAccount(
    userId: string,
    email: string,
    role: string,
    data: UpdateAccountInput,
  ) {
    if (data.profile) {
      await profileService.updateProfile(userId, data.profile);
    }

    if (data.channel) {
      await channelService.updateChannel(userId, data.channel);
    }

    return this.getAccount(userId, email, role);
  }

  /**
   * Point the profile — and the channel, when there is one — at a newly
   * uploaded image.
   *
   * The two are mirrored deliberately: video-service records only carry a
   * userId, so watch pages, comments and search all read the picture off the
   * channel. Keeping them in step is what makes an uploaded avatar show up
   * everywhere the user appears.
   *
   * Pass `url: null` to clear the image.
   */
  async setImage(
    userId: string,
    email: string,
    role: string,
    kind: "avatar" | "banner",
    url: string | null,
  ) {
    const profile = await profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Set up your account before uploading images.");
    }

    const channel = await channelRepository.findByOwnerId(userId);

    const replaced =
      kind === "avatar"
        ? [profile.avatarUrl, channel?.avatarUrl]
        : [profile.bannerUrl, channel?.bannerUrl];

    const patch = kind === "avatar" ? { avatarUrl: url } : { bannerUrl: url };

    await profileRepository.update(userId, patch);

    if (channel) {
      await channelRepository.update(userId, patch);
    }

    // Only now that the new URL is committed is it safe to drop the old files.
    for (const previous of new Set(replaced)) {
      if (previous !== url) {
        removeStoredImage(previous);
      }
    }

    return this.getAccount(userId, email, role);
  }

  /**
   * Delete the channel then the profile. The profile is the parent row, so the
   * channel has to go first or the FK rejects the delete.
   */
  async deleteAccount(userId: string) {
    const profile = await profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    const channel = await channelRepository.findByOwnerId(userId);

    if (channel) {
      await subscriptionRepository.deleteByChannelId(channel.id);
      await channelRepository.delete(userId);
    }

    await subscriptionRepository.deleteBySubscriberId(userId);
    await profileRepository.delete(userId);

    for (const url of new Set([
      profile.avatarUrl,
      profile.bannerUrl,
      channel?.avatarUrl,
      channel?.bannerUrl,
    ])) {
      removeStoredImage(url);
    }
  }

  private async availableUsername(base: string) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate =
        attempt === 0 ? base : `${base}${randomBytes(2).toString("hex")}`;

      if (!(await profileRepository.findByUsername(candidate))) {
        return candidate;
      }
    }

    return `${base}${randomBytes(4).toString("hex")}`;
  }

  private async availableHandle(base: string) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate =
        attempt === 0 ? base : `${base}${randomBytes(2).toString("hex")}`;

      if (!(await channelRepository.findByHandle(candidate))) {
        return candidate;
      }
    }

    return `${base}${randomBytes(4).toString("hex")}`;
  }
}

const accountService = new AccountService();

export default accountService;
