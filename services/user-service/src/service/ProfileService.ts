import profileRepository from "../repository/ProfileRepository.js";
import type {
  CreateProfileInput,
  UpdateProfileInput,
} from "../validation/index.js";

import { ConflictError, NotFoundError } from "@video-streaming/common";

class ProfileService {
  /**
   * Create profile for authenticated user
   */
  async createProfile(userId: string, data: CreateProfileInput) {
    const existingProfile = await profileRepository.findByUserId(userId);

    if (existingProfile) {
      throw new ConflictError("Profile already exists.");
    }

    const usernameExists = await profileRepository.findByUsername(
      data.username,
    );

    if (usernameExists) {
      throw new ConflictError("Username already taken.");
    }

    return profileRepository.create({
      userId,
      ...data,
    });
  }

  /**
   * Get authenticated user's profile
   */
  async getMyProfile(userId: string) {
    const profile = await profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    return profile;
  }

  /**
   * Get public profile by username
   */
  async getProfileByUsername(username: string) {
    const profile = await profileRepository.findByUsername(username);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    return profile;
  }

  /**
   * Update authenticated user's profile
   */
  async updateProfile(userId: string, data: UpdateProfileInput) {
    const profile = await profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    if (data.username && data.username !== profile.username) {
      const usernameExists = await profileRepository.findByUsername(
        data.username,
      );

      if (usernameExists) {
        throw new ConflictError("Username already taken.");
      }
    }

    return profileRepository.update(userId, data);
  }

  /**
   * Delete authenticated user's profile
   */
  async deleteProfile(userId: string) {
    const profile = await profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    await profileRepository.delete(userId);

    return;
  }
}

const profileService = new ProfileService();

export default profileService;
